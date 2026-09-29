import type { DraftArticle } from "../types.ts";

/**
 * The beginner-question piece. Search demand puts the belt system and the
 * time to blue belt at the head of everything a new grappler looks up, and
 * the pages that rank for those questions answer them with figures that carry
 * no source. This one carries a source for every figure and hedges the rest.
 *
 * The belts and their minimums come from the IBJJF's General System of
 * Graduation, read from the PDF linked on the federation's own page. The time
 * to each belt and the cost figures come from one retailer's self-reported
 * survey and are described as that. The injury figure comes from a
 * peer-reviewed survey whose abstract states its method. Age has no figure
 * because no source we could cite gives one, and this piece does not invent
 * one. The Airlock page is one room's policy; the Evolve MMA page is general
 * advice published by an academy.
 *
 * What to wear gets the first-week answer only; the longer dress-policy piece
 * is still a draft and is not pointed at. This article makes no medical, hygiene or injury-prevention claim of
 * its own.
 *
 * Draft: no author has read this piece, so it carries no byline and no date.
 */
export const howLongToBlueBeltAndOtherFirstWeekQuestions: DraftArticle = {
  status: "draft",
  slug: "how-long-to-blue-belt-and-other-first-week-questions",
  category: "training-culture",
  title:
    "How long does it take to get a blue belt in BJJ, and the other first-week questions",
  metaTitle: "How long to a BJJ blue belt, what it costs",
  standfirst:
    "The IBJJF's minimum times from blue belt to black add up to four and a half years; the one survey we could find puts the same distance at eleven. The belt order, the time to blue, what a month costs, and blanks where nobody has measured anything.",
  metaDescription:
    "How long a BJJ blue belt takes, from the one survey we could find; the belt order from the IBJJF; what monthly dues cost; and blanks where nobody has measured.",
  sections: [
    {
      id: "the-belts-in-order",
      heading: "The belts, in the order the federation lists them",
      paragraphs: [
        "Article 1.2 of the IBJJF's General System of Graduation lists the belts for athletes 16 and older in this order: white, blue, purple, brown, black, red and black, red and white, red. Children aged 4 to 15 have a separate ladder of grey, yellow, orange and green belts, each in three shades, and the document says a child holding one of those coloured belts moves to blue, or from green to blue or purple at the professor's decision, in the year they turn 16.",
        "The minimum ages sit in the article the document numbers 2.1.2. White belt is any age. Blue and purple require 16 or older, brown requires 18, and black is listed at 18 with an asterisk restricting that age to athletes who have won the adult world title at brown belt.",
        "The minimum time at each belt, for adults from 18, is in the article the body numbers 3.1.3. White belt has no minimum time. Blue belt requires two years, reduced to one for an athlete previously registered at grey, yellow or orange, and waived for a former green belt, a former juvenile blue belt or an adult blue belt world champion. Purple requires a year and a half, brown requires one year, and the same kinds of exceptions apply. Black belt and above run on fixed periods rather than minimums: 31 years at black, 7 at red and black, 10 at red and white.",
        "Two sentences in the observations matter more than the table. Article 3.2.1 counts every period from the day the athlete registers the belt with the federation, and Article 3.2.2 says the time from white to black is at the professor's discretion, with the federation recognising a graduation only if the minimums are met. The IBJJF sets floors for its own recognition, and the room you train in sets everything else.",
        "Stripes, which the document calls degrees, are four per belt from white to brown and six on black, and Article 4.1.3 leaves their use, up to and including brown belt, at the professor's discretion. A gym that gives no stripes at all is following the document as closely as one that gives four.",
      ],
    },
    {
      id: "how-long-to-blue-belt",
      heading: "How long to blue belt: the survey figure and what it measures",
      paragraphs: [
        "The federation's minimum for white belt is zero, so the question has no regulatory answer and the only figures come from asking people. The one survey we could find with a stated sample is Gold BJJ's State of Jiu Jitsu survey, run in late 2024 and early 2025 by an apparel retailer, which its statistics page says drew nearly 2,000 responses and, in the section that gives a count, 1,948 respondents.",
        "Its table of average years to earn each belt reads 2.3 for blue, 5.6 for purple, 9.0 for brown and 13.3 for black, with the years spent at each belt given as 3.3 at blue, 3.4 at purple and 4.4 at brown. The page adds that it filtered out extreme numbers and that the medians were nearly the same as the averages.",
        "The respondents chose to answer a retailer's survey, reported their own dates from memory, and are the people still training, since somebody who quit at white belt has no blue belt date to give. Each of those selects for longer, more committed careers, and the page does not say how it weighted for any of them. A gym's own answer will be closer to your situation than a global average. Evolve MMA's FAQ, which is general advice about the sport rather than that academy's policy, puts blue belt at about two years of consistent training.",
        "The survey's figures also show something the minimums hide. The IBJJF's floors from blue to black add up to four and a half years, and the survey's respondents report eleven years for the same distance. The regulatory minimum and the reported reality differ by a factor of about two and a half, so an academy that promotes on the federation's schedule would be promoting faster than almost everybody in that sample.",
      ],
    },
    {
      id: "what-it-costs",
      heading: "What it costs, and why nobody can quote you a price",
      paragraphs: [
        "The same Gold BJJ survey asked about monthly dues, and its page gives regional averages: 146.15 US dollars in the United States, 100.83 in Europe, 154.29 in Asia and 150.00 in Brazil. It also lists a few US states between about 153 and 173 dollars. The page's author, writing from San Diego, adds that dues there are closer to 200, which is a useful reminder that a national average describes no particular gym.",
        "Those figures are self-reported by the same respondents as the belt figures, and the page does not say whether they include family plans, annual contracts or introductory rates. Nothing on this site says what any academy charges, and a reader should ask the room.",
        "The sources only partly explain the spread. Jiu Jitsu Legacy, a blog that compiled what it calls the ten most asked questions about the sport on Google without stating its method, gives rent as the main cost and claims that close to half a school's monthly income can go to it.",
        "One cost a no-gi beginner does not have is the uniform. 10th Planet Airlock's page for new students says a gi costs anywhere from 80 to 200 dollars, that its classes are no-gi only, and that a student will never need one there. The same page says the first class at that gym is free. Trial policies vary from room to room.",
      ],
    },
    {
      id: "how-old-is-too-old",
      heading: "How old is too old",
      paragraphs: [
        "No source gives a figure. What they do say is narrower. The IBJJF's graduation document sets a minimum age for every belt and an upper age for none, lists white belt as any age, and defines masters divisions up to one for athletes 61 and up. Its red belt requires the athlete to be 66 or older, which is a rank written for people still registered past that age.",
        "At the other end, the IBJJF's children's belts start at age 4, and Evolve MMA's FAQ says children can train from four years old and that children a little younger can also train. Neither is a claim about what is right for any particular child.",
      ],
    },
    {
      id: "what-to-wear",
      heading: "What to wear",
      paragraphs: [
        "For a no-gi class, athletic clothing you can move in, with nothing on it that can catch. Airlock's page asks for clothing without zippers, buttons or pockets and says a T-shirt and shorts or leggings works perfectly for a first visit. Evolve's FAQ asks for clean shorts and shirts for no-gi classes. The IBJJF's competition rule for no-gi attire, clause 8.1.16 of the rule book on its books and videos page, requires shorts without pockets or with the pockets stitched shut, and without buttons, exposed drawstrings, zippers or any plastic or metal that could present a risk to the opponent, which is where the gym conventions come from.",
        "That is the whole of the first-week answer, and nothing in it needs to be bought.",
      ],
    },
    {
      id: "first-class-etiquette",
      heading: "First-class etiquette, from the rooms that write it down",
      paragraphs: [
        "Etiquette is local. Two academy pages publish lists in enough detail to compare, and they agree on more than the dress policies did.",
        "Airlock's list for a new student is about the body you bring. Shower before class if you can, especially straight from work. Wear deodorant every time. Trim fingernails and toenails short, which the page calls the single most common cause of scratches and cuts on the mat and completely preventable. Wear clean training clothes every session and never the same shirt twice between washes. Brush your teeth. Take off rings, watches, necklaces and earrings, because jewellery can catch on skin or clothing.",
        "Evolve's FAQ gives a conduct list it calls the basic rules in most BJJ gyms. Be respectful toward your instructors and training partners. Keep fingernails and toenails trimmed. Avoid jewellery. Do not attend under the influence. Stay away if you are contagious. Maintain hygiene, refrain from offensive language, and arrive on time. Nails and jewellery are on both lists and in the rule book, at 8.2.1 and 8.3.7.",
        "Neither page covers the things a beginner most often worries about, such as who to ask to roll, how hard to go, or how to tap, and we have not found a published policy that does. Those are usually answered by the coach at the start of a first class, and a beginner who is unsure should ask rather than guess. Where a room's own page publishes a rule, that rule overrides anything here.",
      ],
    },
    {
      id: "is-it-safe",
      heading: "Is it safe: what the two surveys measured",
      paragraphs: [
        "The peer-reviewed figure comes from Moriarty, Charnoff and Felix, Injury rate and pattern among Brazilian jiu-jitsu practitioners: a survey study, in Physical Therapy in Sport, volume 39, 2019, pages 107 to 113. The abstract states the design as a descriptive epidemiology study by online survey of 1,287 adult practitioners, measuring six-month injury incidence and pattern. It reports that 59.2 percent of practitioners had at least one injury over six months, and that the knee was the most common site.",
        "The abstract's risk findings are the part that bears on a beginner. Injury incidence was lower with more years of training and higher body weight, and higher with more training days per week and with being an instructor. Less experienced athletes more often reported head, upper extremity and elbow injuries, and more experienced ones low back injuries. Gi preference, instruction in break-falling and participation in a structured beginner's programme were not predictive of injury risk in the analysis.",
        "The Gold BJJ survey asked a different question and got a different number. Of its 1,948 respondents, 1,347, or 69.1 percent, said they had not sustained a serious injury on the mats. The page does not define serious, does not bound the period, and asks about a whole training career rather than six months, so the two figures are not in conflict and cannot be compared. The same page cites the 59.2 percent figure as a 2019 study without naming it, and we have cited the study directly instead.",
        "What neither survey can tell you is what an injury was, how long it lasted, or what the person was doing when it happened. A survey that counts any injury in six months counts a bruised rib and a torn ligament as one each. Anything about your own body is a question for a clinician, and any gym that says it is injury-free is saying something no survey supports.",
      ],
    },
    {
      id: "what-to-ask-the-room",
      heading: "What nobody can answer for you, and what to ask instead",
      paragraphs: [
        "Every figure above is an average across rooms or a floor set by a federation, and the room you walk into sets its own. The federation's minimum for blue belt is zero years; the survey's respondents report 2.3; your coach decides.",
        "Ask the room four things. What its trial policy is and what a month costs. Whether it promotes on stripes, on time, on competition results or on the coach's judgement. Whether beginners have their own class or roll with everyone from the first night. And what it wants you to wear, since that varies more between rooms than the published policies would suggest.",
        "The published figures do one job: they tell you when a room's answer is unusual. A gym that promises blue belt in six months is promising something the federation's minimums allow and the survey's average sits well above. A gym charging three times the regional average may have its reasons, and it should be able to say what the difference buys.",
      ],
    },
  ],
  sources: [
    {
      title:
        "Graduation System page, linking the General System of Graduation PDF (filename 20260611_IBJJF_Graduacao_EN.pdf; cover dated June 2026; back cover reads VERSION 3.3; page footer reads VERSION 3.1 2025): belt order at 1.2, minimum ages at 2.1.2, minimum periods at 3.1.3 and 3.1.4, observations at 3.2, degrees at 4.1. The index numbers these articles one higher than the body does",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/graduation-system",
      accessed: "2026-09-25",
    },
    {
      title:
        "BJJ Statistics: Jiu Jitsu by the Numbers. The State of Jiu Jitsu survey (late 2024 to early 2025, nearly 2,000 responses; 1,948 in the injury section): average years to each belt, average monthly dues by region and state, and the share reporting no serious injury. Self-reported; the page links an anonymised CSV of the responses",
      publisher: "Gold BJJ",
      url: "https://goldbjj.com/blogs/roll/statistics",
      accessed: "2026-09-25",
    },
    {
      title:
        "Moriarty C, Charnoff J, Felix ER. Injury rate and pattern among Brazilian jiu-jitsu practitioners: a survey study. Physical Therapy in Sport 2019;39:107-113, doi 10.1016/j.ptsp.2019.06.012. Abstract via PubMed: online survey of 1,287 adult practitioners, 59.2 percent injured in six months, knee most common, risk factors",
      publisher: "PubMed, National Library of Medicine",
      url: "https://pubmed.ncbi.nlm.nih.gov/31288212/",
      accessed: "2026-09-25",
    },
    {
      title:
        "What to Wear to Your First Jiu Jitsu Class: clothing without zippers, buttons or pockets; hygiene and jewellery list for new students; gi cost range and no-gi-only policy; free first class at this gym. No date on the page",
      publisher: "10th Planet Airlock",
      url: "https://airlockbjj.com/jiu-jitsu/what-to-wear-to-jiu-jitsu/",
      accessed: "2026-09-25",
    },
    {
      title:
        "Frequently Asked Questions About BJJ: general advice about the sport rather than this academy's policy. What to bring, children training from four and a little younger, etiquette rules it calls basic in most BJJ gyms, and blue belt in about two years of consistent training. No date on the page",
      publisher: "Evolve MMA",
      url: "https://evolve-mma.com/blog/frequently-asked-questions-about-bjj/",
      accessed: "2026-09-25",
    },
    {
      title:
        "IBJJF Rule Book (PDF filename 2024JUN_IBJJF_Rules_EN.pdf; page footer reads VERSION 6.1 2024): no-gi attire at 8.1.16, nails at 8.2.1, jewellery at 8.3.7",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/books-videos",
      accessed: "2026-09-25",
    },
    {
      title:
        "The Most Common BJJ Questions: a list the blog describes as the ten most asked on Google, method not stated; cited only for its claim about rent as a share of a school's income",
      publisher: "Jiu Jitsu Legacy",
      url: "https://jiujitsulegacy.com/bjj-lifestyle/the-most-common-bjj-questions/",
      accessed: "2026-09-25",
    },
  ],
  relatedSlugs: [
    "the-dropout-number-nobody-can-source",
    "how-a-bjj-rash-guard-should-fit",
    "ibjjf-no-gi-uniform-rules-read-carefully",
    "drilling-rehearsing-and-positional-sparring",
  ],
  contestedNotes: [
    "The time-to-belt and cost figures are from one retailer's self-reported survey of people still training, and the page does not describe its weighting. It links an anonymised CSV of the responses, which this article has not re-analysed. They are the only sample-backed figures we could find and are reported as that.",
    "The IBJJF graduation document's index and body number its articles differently, and it carries three version markers that disagree: a cover dated June 2026, a back cover reading version 3.3 and a page footer reading version 3.1 2025. Clauses are cited by the body's numbering as read on the accessed date.",
    "No source gives an age at which a person should or should not start, and this article gives none.",
    "Airlock's page is one room's published policy; Evolve MMA's FAQ is general advice published by an academy. They are not a sample, and nothing here says how common any of their rules is.",
    "The Jiu Jitsu Legacy claim about rent is the blog's own and has not been checked against any academy's accounts.",
    "This article makes no medical claim. The injury figures are reported with the sample and period each source states, and the two are not comparable with each other.",
  ],
};
