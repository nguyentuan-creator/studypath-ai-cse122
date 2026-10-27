/* AI-1 roadmap engine — rule-based, deterministic, chạy hoàn toàn client-side.
   Không gọi LLM: kết quả được tính từ courses.json + hồ sơ mục tiêu để giải thích được. */
(function () {
  "use strict";

  var TERMS = 8;
  var MAX_TERMS = 12;
  var TARGET_CREDITS = 130;
  var WORKLOAD_LIMIT = 18;

  var BUDGETS = {
    low: { cap: 14, label: "< 10 giờ / tuần" },
    mid: { cap: 16, label: "10–20 giờ / tuần" },
    high: { cap: 20, label: "> 20 giờ / tuần" },
  };

  var CAREER_PROGRAM = {
    "Kỹ sư phần mềm": "Kỹ thuật phần mềm",
    "Chuyên viên phân tích dữ liệu": "Khoa học dữ liệu",
    "Chuyên viên an ninh mạng": "An toàn thông tin",
    "Kỹ sư AI / Machine Learning": "Khoa học máy tính",
  };

  var CAREER_KEYWORDS = {
    "Kỹ sư phần mềm": ["phan mem", "lap trinh", "web", "huong doi tuong", "kien truc"],
    "Chuyên viên phân tích dữ liệu": ["phan tich", "du lieu", "thong ke", "hoc may"],
    "Chuyên viên an ninh mạng": ["an ninh", "bao mat", "mang", "he dieu hanh"],
    "Kỹ sư AI / Machine Learning": ["tri tue", "hoc may", "du lieu", "thuat toan"],
  };

  var INTEREST_KEYWORDS = {
    "Lập trình": ["lap trinh", "huong doi tuong", "ky thuat lap trinh"],
    "Giải thuật": ["giai thuat", "cau truc du lieu", "thuat toan"],
    "Cơ sở dữ liệu": ["co so du lieu", "du lieu", "sql"],
    "Phát triển Web": ["web", "frontend", "backend"],
  };

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/đ/g, "d");
  }

  function sumCredits(courses) {
    return courses.reduce(function (total, course) {
      return total + Number(course.credits || 0);
    }, 0);
  }

  function resolveProgram(catalog, rawProgram) {
    var name = String(rawProgram || "").replace(/\s*\(.*\)\s*$/, "").trim();
    var exact = catalog.find(function (course) {
      return course.program === name;
    });
    if (exact) return exact.program;

    var prefixed = catalog.find(function (course) {
      return name && course.program.indexOf(name) === 0;
    });
    return prefixed ? prefixed.program : catalog.length ? catalog[0].program : "";
  }

  function variantScore(course, seed) {
    if (!seed) return 0;
    var text = course.code + ":" + seed;
    var hash = 0;
    for (var index = 0; index < text.length; index += 1) {
      hash = (hash * 31 + text.charCodeAt(index)) % 997;
    }
    return (hash % 5) * 0.4;
  }

  function relevance(course, input) {
    var text = normalize(course.name + " " + course.code + " " + (course.description || ""));
    var score = 0;

    (CAREER_KEYWORDS[input.career] || []).forEach(function (keyword) {
      if (text.indexOf(keyword) !== -1) score += 2;
    });

    input.interests.forEach(function (interest) {
      var keywords = INTEREST_KEYWORDS[interest] || [normalize(interest)];
      keywords.forEach(function (keyword) {
        if (text.indexOf(keyword) !== -1) score += 1;
      });
    });

    return score;
  }

  function selectCourses(catalog, input) {
    var open = catalog.filter(function (course) {
      return course.status !== "Tạm ngưng";
    });
    var selected = open.filter(function (course) {
      return course.program === input.program;
    });

    var codes = {};
    selected.forEach(function (course) {
      codes[course.code] = true;
    });

    var careerProgram = CAREER_PROGRAM[input.career];
    var pool = open
      .filter(function (course) {
        return !codes[course.code];
      })
      .map(function (course) {
        var bonus = course.program === careerProgram ? 3 : 0;
        return { course: course, score: relevance(course, input) + bonus };
      })
      .sort(function (a, b) {
        return b.score - a.score || a.course.code.localeCompare(b.course.code);
      })
      .map(function (entry) {
        return entry.course;
      });

    function prereqsReady(course) {
      return (course.prereqs || []).every(function (code) {
        if (codes[code]) return true;
        return !catalog.some(function (item) {
          return item.code === code;
        });
      });
    }

    for (var pass = 0; pass < 3 && sumCredits(selected) < TARGET_CREDITS; pass += 1) {
      var added = false;
      pool.forEach(function (course) {
        if (sumCredits(selected) >= TARGET_CREDITS) return;
        if (codes[course.code] || !prereqsReady(course)) return;
        selected.push(course);
        codes[course.code] = true;
        added = true;
      });
      if (!added) break;
    }

    return selected;
  }

  function orderByPrereqs(courses, input) {
    var byCode = {};
    courses.forEach(function (course) {
      byCode[course.code] = course;
    });

    var priority = courses.slice().sort(function (a, b) {
      var scoreA = relevance(a, input) + variantScore(a, input.seed);
      var scoreB = relevance(b, input) + variantScore(b, input.seed);
      return scoreB - scoreA || a.code.localeCompare(b.code);
    });
    var visited = {};
    var ordered = [];

    function visit(course) {
      if (visited[course.code]) return;
      visited[course.code] = true;
      (course.prereqs || []).forEach(function (code) {
        if (byCode[code]) visit(byCode[code]);
      });
      ordered.push(course);
    }

    priority.forEach(visit);
    return ordered;
  }

  function packSemesters(courses, cap, priorities, terms) {
    var remaining = courses.slice();
    var semesters = [];
    var reducedTerm = -1;

    if (priorities.indexOf("Giảm tải học kỳ thực tập") !== -1) {
      reducedTerm = 6;
    }

    for (var term = 0; term < terms; term += 1) {
      var termsLeft = terms - term;
      var termCap = cap;
      if (term === reducedTerm) {
        termCap = Math.max(9, cap - 4);
      }

      var target = Math.ceil(sumCredits(remaining) / termsLeft);
      var picked = [];
      var load = 0;

      while (remaining.length) {
        if (load >= target && termsLeft > 1) break;
        var course = remaining[0];
        var next = load + Number(course.credits || 0);
        if (next > termCap) break;
        picked.push(course);
        remaining.shift();
        load = next;
      }

      semesters.push({ id: "HK" + (term + 1), courses: picked, credits: load });
    }

    return { semesters: semesters, remaining: remaining };
  }

  function buildRoadmap(options) {
    var catalog = (options && options.catalog) || [];
    var input = {
      career: (options && options.input && options.input.career) || "Kỹ sư phần mềm",
      interests: (options && options.input && options.input.interests) || [],
      budget: (options && options.input && options.input.budget) || "mid",
      priorities: (options && options.input && options.input.priorities) || [],
      seed: Number((options && options.input && options.input.seed) || 0),
      program: resolveProgram(catalog, options && options.input && options.input.program),
    };

    var budget = BUDGETS[input.budget] || BUDGETS.mid;
    var courses = orderByPrereqs(selectCourses(catalog, input), input);
    var total = sumCredits(courses);
    var terms = TERMS;
    var packed = packSemesters(courses, budget.cap, input.priorities, terms);

    while (packed.remaining.length && terms < MAX_TERMS) {
      terms += 1;
      packed = packSemesters(courses, budget.cap, input.priorities, terms);
    }

    var usedTerms = packed.semesters.length;
    var feasible = packed.remaining.length === 0;
    var maxCredits = packed.semesters.reduce(function (max, semester) {
      return Math.max(max, semester.credits);
    }, 0);

    var internshipTerm = input.priorities.indexOf("Giảm tải học kỳ thực tập") !== -1 ? 6 : -1;
    var riskTerms = [];

    var semesters = packed.semesters.map(function (semester) {
      var risk = semester.credits > WORKLOAD_LIMIT;
      if (risk) riskTerms.push(semester.id);
      return {
        id: semester.id,
        credits: semester.credits,
        risk: risk,
        courses: semester.courses.map(function (course) {
          return {
            id: course.id,
            code: course.code,
            name: course.name,
            credits: course.credits,
          };
        }),
      };
    });

    var reasons = [
      "Quỹ thời gian " + budget.label + " → tối đa " + budget.cap + " tín chỉ/học kỳ.",
      "Đã xếp " + courses.length + " học phần (" + total + " tín chỉ) vào " + usedTerms +
        " học kỳ, cao nhất " + maxCredits + " tín chỉ/học kỳ.",
    ];

    if (usedTerms > TERMS) {
      reasons.push(
        "Quỹ " + budget.cap + " tín chỉ/kỳ chỉ xếp được tối đa " + budget.cap * TERMS +
          " tín chỉ trong " + TERMS + " kỳ → AI kéo dài lên " + usedTerms + " học kỳ" +
          (input.priorities.indexOf("Hoàn thành đúng 8 học kỳ") !== -1
            ? " (ưu tiên 8 kỳ không khả thi)."
            : ".")
      );
    }

    var matched = courses.filter(function (course) {
      return relevance(course, input) > 0;
    }).length;
    if (matched) {
      reasons.push("Ưu tiên " + input.career + ": " + matched +
        " học phần liên quan mục tiêu được xếp sớm.");
    }

    var prereqCount = courses.filter(function (course) {
      return (course.prereqs || []).length > 0;
    }).length;
    reasons.push("Đã kiểm tra thứ tự tiên quyết cho " + prereqCount + " học phần có môn trước.");

    if (internshipTerm !== -1) {
      reasons.push("Học kỳ 7 giảm còn " + semesters[internshipTerm].credits +
        " tín chỉ để dành thời gian thực tập.");
    }

    if (riskTerms.length) {
      reasons.push(riskTerms.join(", ") + " vượt ngưỡng " + WORKLOAD_LIMIT +
        " tín chỉ → AI-2 cảnh báo quá tải.");
    }

    var warnings = [];
    var shortfall = 0;
    if (!feasible) {
      var placedCredits = total - sumCredits(packed.remaining);
      shortfall = total - placedCredits;
      warnings.push("Quỹ " + budget.cap + " tín chỉ/kỳ xếp được " + placedCredits +
        "/" + total + " tín chỉ trong " + usedTerms + " học kỳ.");
      warnings.push("Cần tối thiểu " + Math.ceil(total / TERMS) +
        " tín chỉ/kỳ để hoàn thành đúng 8 học kỳ.");
    }

    var confidence = 0.78 + input.interests.length * 0.04;
    if (input.priorities.indexOf("Ưu tiên môn thế mạnh") !== -1) confidence += 0.03;
    if (!feasible) confidence = 0.55;
    else if (usedTerms > TERMS) confidence -= Math.min(0.12, (usedTerms - TERMS) * 0.03);
    confidence += (input.seed % 3) * 0.01;
    confidence = Math.min(0.94, Math.round(confidence * 100) / 100);

    return {
      feasible: feasible,
      semesters: semesters,
      terms: usedTerms,
      total: total,
      maxCredits: maxCredits,
      courseCount: courses.length,
      prereqCount: prereqCount,
      matched: matched,
      confidence: confidence,
      riskLevel: !feasible ? "high" : riskTerms.length ? "medium" : "low",
      reasons: reasons,
      warnings: warnings,
      shortfall: shortfall,
      input: input,
    };
  }

  window.AIEngine = {
    buildRoadmap: buildRoadmap,
    BUDGETS: BUDGETS,
    TERMS: TERMS,
    MAX_TERMS: MAX_TERMS,
    WORKLOAD_LIMIT: WORKLOAD_LIMIT,
  };
})();
