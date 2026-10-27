/* AI-2 Workload Risk — rule engine (deterministic, replaceable by a real API) */
(function () {
  "use strict";

  var THRESHOLD = 18;
  var HEAVY_CREDITS = 4;

  function numberOf(value) {
    var parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
  }

  function signature(courses) {
    return (courses || [])
      .map(function (course) {
        return String(course.id) + ":" + numberOf(course.credits);
      })
      .sort()
      .join("|");
  }

  function duplicateCourses(courses) {
    var seen = Object.create(null);
    var duplicates = [];

    courses.forEach(function (course) {
      var key = String(course.id || course.code);
      if (seen[key]) {
        if (duplicates.indexOf(course.code) === -1) duplicates.push(course.code);
      } else {
        seen[key] = true;
      }
    });

    return duplicates;
  }

  function missingPrerequisites(courses, completedCodes) {
    var inPlan = Object.create(null);
    courses.forEach(function (course) {
      inPlan[course.code] = true;
    });

    var completed = Object.create(null);
    (completedCodes || []).forEach(function (code) {
      completed[code] = true;
    });

    var missing = [];
    courses.forEach(function (course) {
      (course.prereqs || []).forEach(function (prereq) {
        if (!inPlan[prereq] && !completed[prereq]) {
          missing.push({
            courseId: course.id,
            courseCode: course.code,
            courseName: course.name,
            prereq: prereq,
          });
        }
      });
    });

    return missing;
  }

  function pickReduction(courses, total, missing) {
    var missingByCourse = Object.create(null);
    missing.forEach(function (entry) {
      missingByCourse[entry.courseCode] = (missingByCourse[entry.courseCode] || 0) + 1;
    });

    var byCode = Object.create(null);
    courses.forEach(function (course) {
      byCode[course.code] = course;
    });

    var requiredBy = Object.create(null);
    courses.forEach(function (course) {
      (course.prereqs || []).forEach(function (prereq) {
        if (!byCode[prereq]) return;
        if (!requiredBy[prereq]) requiredBy[prereq] = [];
        requiredBy[prereq].push(course.code);
      });
    });

    var candidates = courses
      .map(function (course) {
        var dependsOn = requiredBy[course.code] || [];
        var score =
          numberOf(course.credits) * 4 +
          (missingByCourse[course.code] ? 6 : 0) +
          ((course.prereqs || []).length ? 2 : 0) +
          (numberOf(course.credits) >= 5 ? 4 : 0);

        return {
          course: course,
          dependsOn: dependsOn,
          score: score,
        };
      })
      .sort(function (a, b) {
        return (
          a.dependsOn.length - b.dependsOn.length ||
          b.score - a.score ||
          String(a.course.code).localeCompare(String(b.course.code))
        );
      });

    var removed = Object.create(null);
    var recommended = [];
    var projected = total;

    candidates.forEach(function (candidate) {
      if (projected <= THRESHOLD) return;
      if (candidate.dependsOn.length) return;
      if (removed[candidate.course.code]) return;

      recommended.push(candidate.course);
      removed[candidate.course.code] = true;
      projected -= numberOf(candidate.course.credits);
    });

    if (projected > THRESHOLD && recommended.length === 0) {
      var fallback = candidates[0];
      if (fallback) {
        recommended.push(fallback.course);
        projected -= numberOf(fallback.course.credits);
      }
    }

    if (!recommended.length) return null;

    return {
      courses: recommended.map(function (course) {
        return {
          id: course.id,
          code: course.code,
          name: course.name,
          credits: numberOf(course.credits),
        };
      }),
      projectedTotal: projected,
    };
  }

  function analyze(options) {
    var courses = (options && options.courses ? options.courses : []).slice();
    var completedCodes = (options && options.completedCodes) || [];
    var plan = (options && options.plan) || {};

    var total = courses.reduce(function (sum, course) {
      return sum + numberOf(course.credits);
    }, 0);
    var count = courses.length;
    var heavy = courses.filter(function (course) {
      return numberOf(course.credits) >= HEAVY_CREDITS;
    });
    var heavyCredits = heavy.reduce(function (sum, course) {
      return sum + numberOf(course.credits);
    }, 0);
    var duplicates = duplicateCourses(courses);
    var missing = missingPrerequisites(courses, completedCodes);
    var overloaded = total > THRESHOLD;
    var atLimit = total === THRESHOLD && total > 0;
    var riskLevel = overloaded
      ? "high"
      : atLimit || missing.length || duplicates.length || heavy.length >= 3 || count >= 6
        ? "medium"
        : "low";

    var confidence = 0.9;
    if (overloaded) confidence = 0.91;
    if (missing.length) confidence -= 0.04;
    if (duplicates.length) confidence -= 0.05;
    if (count >= 6) confidence -= 0.02;
    if (!count) confidence = 0.2;
    confidence = Math.max(0.55, Math.min(0.94, Math.round(confidence * 100) / 100));

    var reasons = [];

    if (!count) {
      reasons.push("Kế hoạch chưa có học phần nào nên AI-2 không đủ dữ liệu phân tích.");
    } else {
      if (overloaded) {
        reasons.push(
          "Tổng " +
            total +
            " tín chỉ — vượt ngưỡng cảnh báo " +
            THRESHOLD +
            " tín chỉ là " +
            (total - THRESHOLD) +
            " tín chỉ."
        );
      } else if (atLimit) {
        reasons.push(
          "Tổng " + total + " tín chỉ chạm đúng ngưỡng cảnh báo " + THRESHOLD + " tín chỉ."
        );
      } else {
        reasons.push(
          "Tổng " + total + " tín chỉ, còn " + (THRESHOLD - total) + " tín chỉ dưới ngưỡng cảnh báo " + THRESHOLD + "."
        );
      }

      if (heavy.length >= 2) {
        reasons.push(
          heavy.length +
            " học phần từ " +
            HEAVY_CREDITS +
            " tín chỉ trở lên chiếm " +
            heavyCredits +
            "/" +
            total +
            " tín chỉ (" +
            heavy.map(function (course) { return course.code; }).join(", ") +
            ")."
        );
      }

      if (count >= 6) {
        reasons.push(count + " học phần trong cùng một học kỳ — mật độ học tập cao.");
      } else if (count >= 5) {
        reasons.push(count + " học phần trong một học kỳ, cần phân bổ thời gian hợp lý.");
      }

      if (missing.length === 1) {
        reasons.push(
          missing[0].courseCode +
            " chưa thấy môn tiên quyết " +
            missing[0].prereq +
            " trong kế hoạch hoặc các kế hoạch đã duyệt."
        );
      } else if (missing.length > 1) {
        var affected = [];
        missing.forEach(function (entry) {
          if (affected.indexOf(entry.courseCode) === -1) affected.push(entry.courseCode);
        });
        reasons.push(
          missing.length +
            " điều kiện tiên quyết chưa được đáp ứng trong kế hoạch/đã duyệt (" +
            affected.slice(0, 3).join(", ") +
            (affected.length > 3 ? "…" : "") +
            ")."
        );
      }

      if (duplicates.length) {
        reasons.push("Học phần bị trùng trong kế hoạch: " + duplicates.join(", ") + ".");
      }

      if (riskLevel === "low") {
        reasons.push("Không phát hiện yếu tố quá tải đáng kể ở thời điểm hiện tại.");
      }
    }

    var recommendation = overloaded ? pickReduction(courses, total, missing) : null;

    if (recommendation) {
      reasons.push(
        "Gợi ý giảm tải: chuyển " +
          recommendation.courses
            .map(function (course) { return course.code + " (" + course.credits + " TC)"; })
            .join(", ") +
          " khỏi kế hoạch này → còn " +
          recommendation.projectedTotal +
          " tín chỉ."
      );
    }

    return {
      version: 1,
      threshold: THRESHOLD,
      total: total,
      count: count,
      heavyCount: heavy.length,
      heavyCredits: heavyCredits,
      duplicates: duplicates,
      missingPrereqs: missing,
      overloaded: overloaded,
      atLimit: atLimit,
      empty: count === 0,
      riskLevel: riskLevel,
      confidence: confidence,
      reasons: reasons,
      recommendation: recommendation,
      semester: plan.semester || "",
      signature: signature(courses),
      generatedAt: new Date().toISOString(),
    };
  }

  window.WorkloadEngine = {
    analyze: analyze,
    signature: signature,
    THRESHOLD: THRESHOLD,
    HEAVY_CREDITS: HEAVY_CREDITS,
  };
})();
