import type { DraftArticle } from "../types.ts";

/**
 * The numbers piece. Six datasets, each cited with its own scope, and no
 * figure carried from one into another: FightAlpha and GrapplerHQ count every
 * UFC submission from two slightly different bout files; Stellpflug counts
 * chokes only, so its percentages have a different denominator; the Journal of
 * Clinical Medicine study covers numbered events 2000 to 2021; the IBJJF and
 * ADCC figures are grappling, not MMA, and are kept apart for that reason.
 *
 * Where the datasets disagree the disagreement is printed, with the reason
 * where a source gives one. The "top five" share is arithmetic on the cited
 * tables and is described as arithmetic. Nothing in this piece says which
 * technique is best, and nothing in it is a training instruction.
 *
 * The BJJ Heroes page for ADCC 2022 answered a plain HTTP request on the
 * accessed date but refused our fetch tool with a 403; the figures used from it
 * are the ones read from the page text and no others.
 *
 * Draft: no author has read this piece, so it carries no byline and no date.
 */
export const ufcSubmissionsByTheNumbers: DraftArticle = {
  status: "draft",
  slug: "ufc-submissions-by-the-numbers",
  category: "mma-and-jiu-jitsu",
  title: "What actually finishes fights: UFC submissions by the numbers",
  metaTitle: "UFC submissions by the numbers",
  standfirst:
    "Two public counts of every UFC submission, a medical study of every choke, and a peer-reviewed sample of numbered events. They disagree on the details and agree on the shape: five techniques account for about four finishes in five.",
  metaDescription:
    "Two counts of every UFC submission, a medical study of every choke and a peer-reviewed sample, read side by side. Five techniques make four finishes in five.",
  sections: [
    {
      id: "two-counts-of-the-same-fights",
      heading: "Two counts of the same fights",
      paragraphs: [
        "The two most complete public tables were built independently from the same official records, and they land within a percentage point of each other on every technique. FightAlpha's count runs to 20 June 2026 and covers 8,745 UFC fights, of which 1,695 ended by submission, a rate of 19.4 percent. GrapplerHQ's count runs from 11 March 1994 to 28 March 2026 and covers 8,591 bouts with 1,659 submissions, a rate of 19.3 percent. GrapplerHQ names its upstream: an MIT-licensed UFC-DataLab bout file that itself draws on UFCStats and the official scorecards. FightAlpha describes its source as its own enriched UFC fight dataset.",
        "On FightAlpha's table the rear naked choke ended 659 fights, which is 38.9 percent of all submissions and 7.5 percent of all fights. The guillotine follows at 299, or 17.6 percent. The armbar has 202, or 11.9 percent. The arm triangle has 130, or 7.7 percent, and the triangle has 94, or 5.5 percent. Below those five the tail is long and thin: the D'Arce at 47, the kimura at 46, the anaconda at 40, the heel hook at 24 and the kneebar at 20.",
        "GrapplerHQ's table reads 648 rear naked chokes at 39.1 percent, 293 guillotines at 17.7 percent, 195 armbars at 11.8 percent, 126 arm triangles at 7.6 percent and 114 triangles at 6.9 percent. Then 47 D'Arces, 43 kimuras and 38 anacondas, with 155 finishes, or 9.3 percent, filed as all other techniques. The same page groups the whole set by family: chokes were 78.8 percent of UFC submissions, arm-based joint locks 15.0 percent and leg locks 3.3 percent.",
        "Add the first five rows of either table and the result is the number this piece is about. On FightAlpha's figures the rear naked choke, guillotine, armbar, arm triangle and triangle together account for 81.6 percent of submissions. On GrapplerHQ's they account for 83.1 percent. That sum is our arithmetic on their tables, and neither site publishes it as a figure of its own.",
      ],
    },
    {
      id: "where-the-tables-disagree",
      heading: "Where the two tables disagree, and why",
      paragraphs: [
        "The totals differ because the windows differ. FightAlpha's count closes twelve weeks after GrapplerHQ's and includes 154 more fights, which is roughly one quarter of a year of events. That gap explains the extra 36 submissions and most of the small differences in each row, since a technique's count can only rise between the two dates.",
        "The triangle is the exception, and the direction is wrong for a date explanation. GrapplerHQ has 114 triangles at 6.9 percent, and FightAlpha, with the longer window, has 94 at 5.5 percent. A later count cannot hold fewer finishes than an earlier one unless the two are grouping differently. The likely cause is that the finishing-move field in the official records contains variants, such as a triangle armbar or a reverse triangle, and one site folds them into the triangle row while the other leaves them in the tail. Neither page states its grouping rule, so we report the difference and the probable reason without settling it.",
        "The heel hook shows the same effect in the other direction. FightAlpha lists it on its own with 24 finishes, and GrapplerHQ does not list it at all, leaving it inside the 155 other techniques. A reader who wants a leg lock count should therefore use FightAlpha's row or GrapplerHQ's 3.3 percent family figure, and should not compare the two as if they were the same measurement.",
        "The practical lesson is that any single-technique percentage below about three percent depends on a grouping decision the source did not publish. The top five do not have that problem, because each of them is a distinct named finish that both tables count the same way to within a point.",
      ],
    },
    {
      id: "chokes-only",
      heading: "The medical count: chokes only, with a different denominator",
      paragraphs: [
        "Stellpflug, Menton and LeFevere published an analysis of every fight-ending choke in UFC history in The Physician and Sportsmedicine, volume 50, issue 1, pages 60 to 63, online from 31 December 2020. The abstract states the method: existing fight outcome reports plus video analysis of every choke that ended a fight during the study period. The count was 904 chokes, which the authors put at 15.5 percent of fight outcomes and 76.2 percent of grappling submissions.",
        "The headline figure reads differently from the two tables above, and the reason is the denominator. The abstract reports the rear naked choke as 49.1 percent of the total choke finishes, with 19 other choke types making up the remaining 50.9 percent. The base is the 904 chokes rather than the full set of submissions. Chokes are about three quarters of submissions on every count here, and 39 percent of all submissions is about 49 percent of three quarters of them, so the two figures describe the same dominance from different bases.",
        "A summary of the paper on Combat Sports Law, published 26 December 2020, gives the breakdown by choke type: guillotine 13.72 percent, arm-in guillotine 9.73 percent, triangle 8.83 percent and arm triangle 8.19 percent, with about ten percent spread across fourteen further techniques. Those per-type figures come from the summary, and the journal's own page returned a 403 to our request, so we cite the abstract through PubMed for what the abstract says and the summary for the rest.",
        "Two further findings are specific to this study because nobody else looked at them. Right-handed and left-handed chokes were split 50.1 to 49.9 percent, which the authors describe as essentially identical. And most fight-ending chokes ended in a voluntary submission, but 11 percent resulted in loss of consciousness. That figure is reported here as the study reported it, and this piece draws no conclusion from it about what happens inside a person or how a choke should be trained.",
      ],
    },
    {
      id: "the-numbered-events-study",
      heading: "The numbered-events study, verified twice",
      paragraphs: [
        "Mańka-Malara and Trzaskowski's paper in the Journal of Clinical Medicine, 2025, is the only dataset here with a stated verification step. The authors examined 2,488 professional UFC fights between 2000 and 2021, of which 169 were female and 2,319 male, and analysed 462 submissions. They used the official fight statistics and added video verification where a submission was unclear, with the verification conducted independently by two researchers.",
        "Their table of finishing techniques reads: rear naked choke 154, guillotine 89, armbar 63, triangle 35, arm triangle 26 and kimura 21. Chokes were 68.6 percent of submissions, or 317 fights, and arm and hand techniques were 27.1 percent, or 125 fights, with the remainder in an other category. The choke share is ten points below GrapplerHQ's 78.8 percent, and the arm-lock share is twelve points above GrapplerHQ's 15.0 percent, which is what a different window and a different grouping of the tail produce.",
        "Add the five leading rows and 367 of 462 submissions, or 79.4 percent, again come from the same five techniques. The sample is smaller and the years are earlier, and the number is within four points of the two full counts. That is the strongest evidence in this piece that the shape is real rather than an artefact of one site's data cleaning.",
        "The paper also reports a difference by sex that the larger tables do not break out. Women's fights were on average a minute and a half longer, had fewer submission attempts per fight at 0.32 against 0.45, and split their submissions evenly: chokes and hand or arm techniques were each 50 percent of finishes in women's bouts. With 169 female fights in the sample, the split rests on a small number of finishes and should be read that way.",
      ],
    },
    {
      id: "what-changed-after-2011",
      heading: "What changed after 2011",
      paragraphs: [
        "FightAlpha is the only source here that splits its count by era, and it uses 2011 onward as the modern window. Before 2011, 27.0 percent of UFC fights ended by submission. Since 2011 the figure is 17.8 percent. A third of the submission rate has gone, and the fights it left went to decisions and knockouts, which the page does not break down.",
        "The mix inside the smaller share also moved. The page's own words are that rear naked chokes, arm triangles and D'Arce chokes take a bigger share of submission finishes in the modern era, while armbars and triangle chokes take a smaller share. The page presents the shift as a chart of positive and negative bars rather than as a second table, so we cannot print the era-specific percentages and have not estimated them.",
        "The direction of that shift is consistent across the three families. The techniques gaining share are finished from behind or from top position with the head and one arm enclosed, and the techniques losing share are the two classic finishes from closed guard. That reading is ours, and it fits the era comparison without being stated by it, so it belongs in the next section as an inference rather than here as a fact.",
      ],
    },
    {
      id: "grappling-is-a-different-sample",
      heading: "Grappling tournaments are a different sample",
      paragraphs: [
        "Every figure above comes from fights with strikes, gloves and a cage, and a no-gi grappler should read it with that in mind. The two grappling counts we could source are smaller, cover one event each, and are kept separate from the MMA tables on purpose.",
        "The IBJJF published a breakdown of its 2023 World Championships on 20 June 2023, covering the adult black belt quarterfinals through the finals: 128 matches, 70 male and 58 female, with 47 submissions, a rate of 36.72 percent. The male rate was 31.43 percent and the female rate 43.10 percent. The choke from the back accounted for 21 of the 47, or 44.68 percent, the armbar for 10, or 21.28 percent, and the triangle for 4. The page gives no further rows.",
        "For ADCC 2022, BJJ Heroes published a data compilation that puts the count at 40 submissions across the men's and women's brackets, 41 including the open-weight superfight, and a submission rate of 36 percent, which it compares with 35 percent at the 2022 IBJJF Worlds. Of the 40, it counts 11 leg locks and 9 finishes by a guard player. The page answered a plain request on the accessed date but refused our fetch tool with a 403, and it presents the per-technique split as a graphic, so the individual technique counts are not reported here.",
        "Two things transfer from these to the MMA picture, and one does not. The back finish leads the gi tournament by a wider margin than it leads the UFC, at 44.68 percent of submissions against 39 percent. The submission rate at both grappling events is roughly double the modern UFC rate. What does not transfer is the leg lock: 11 of 40 at ADCC is 27.5 percent, against 3.3 percent of UFC submissions on GrapplerHQ's family figure, and that gap comes from the ruleset and its scoring incentives rather than from the technique.",
      ],
    },
    {
      id: "what-it-means-for-a-no-gi-grappler",
      heading: "What this means for a no-gi grappler's priorities",
      paragraphs: [
        "The honest implication is narrower than the tables make it look, because a finish count records the last thing that happened and not the position that made it possible. Read by position rather than by name, the five techniques that account for about eighty percent of UFC submissions come from three places.",
        "The rear naked choke, at 39 percent of submissions in both full counts, is finished from back control, and it does not exist without the seat belt and the chest connection first. The Technique Library's Back Control category covers that position, and the published article on the rear naked strangle covers the finish and the rule-book line between a strangle and a crank.",
        "The guillotine, at 17.6 or 17.7 percent, and the arm triangle, D'Arce and anaconda, which together are between 12.7 and 12.9 percent, are one family of strangles applied from the front headlock and from the head-and-arm enclosure. Between them they are about thirty percent of UFC finishes, and on FightAlpha's era comparison two of the three are gaining share. The Submissions category of the Technique Library is where the site's entries on that family sit, and the Journal's piece on the guillotine from the front headlock is the argument for treating the position as the technique.",
        "The armbar and the triangle, at about 12 and 6 percent, are the two closed-guard finishes, and they are the two whose share FightAlpha reports as falling since 2011. They still finish more fights than everything outside the top five combined, and a grappler who trains no-gi without strikes has less reason than a fighter to let them go. The tables are also silent on where the armbar was applied, and mount and the back both produce it.",
        "Two conclusions follow, and both are about time rather than technique. Back control and the front headlock produce, between them, more than half of all UFC submissions on every count here, and a grappler who can take the back and hold a front headlock is standing where most finishes begin. And escaping those two positions matters as much as attacking from them, because the same five techniques are what will be tried against you. The Defensive Concepts category is the site's set of entries on the frames and hand fighting that stop a position becoming a finish.",
      ],
    },
    {
      id: "what-the-numbers-cannot-tell-you",
      heading: "What these numbers cannot tell you",
      paragraphs: [
        "A finish count is a count of successes and says nothing about attempts. A technique that is tried fifty times and lands once is invisible next to one tried twice that lands twice, and none of the sources here records attempts, apart from the Journal of Clinical Medicine study's per-fight rate, which does not split by technique.",
        "The official finishing-move field is a label chosen at the event, and the two full counts inherit whatever it says. An arm-in guillotine, a triangle armbar and a reverse triangle each land in a different row depending on who typed the result, which is why the triangle count can differ by twenty between two sites reading the same records.",
        "None of the tables records position. The rear naked choke implies the back, but the arm triangle can be finished from mount or from side control and the armbar from four positions, and no dataset here separates them. Our reading of the top five as three positions is a reading, and it is stated as one.",
        "And every figure comes from professionals under one promotion's rules, most of it from men, over a period in which the submission rate itself fell by a third. A different promotion, a different ruleset, a different sex or a different era produces a different table, and the two grappling events above show how large that difference can be. The tables are a place to start allocating training time, and nothing here says that any one of them should decide it.",
      ],
    },
  ],
  sources: [
    {
      title:
        "Most common UFC submissions: 8,745 fights and 1,695 submissions through 20 June 2026, counts and percentages by technique, and the pre-2011 versus 2011-onward era comparison. Article dated 23 June 2026",
      publisher: "FightAlpha",
      url: "https://fightalpha.com/articles/most-common-ufc-submissions",
      accessed: "2026-09-25",
    },
    {
      title:
        "UFC statistics: 8,591 bouts from 11 March 1994 to 28 March 2026, 1,659 submissions, counts and percentages by technique, and the choke, arm lock and leg lock family split. Page marked last updated 3 July 2026",
      publisher: "GrapplerHQ",
      url: "https://www.grapplerhq.com/mma/ufc-statistics/",
      accessed: "2026-09-25",
    },
    {
      title:
        "Stellpflug SJ, Menton WH, LeFevere RC. Analysis of the fight-ending chokes in the history of the Ultimate Fighting Championship mixed martial arts promotion. The Physician and Sportsmedicine 2022;50(1):60-63, online 31 December 2020, doi 10.1080/00913847.2020.1866958. Abstract via PubMed: 904 chokes, 15.5 percent of outcomes, 76.2 percent of submissions, rear naked choke 49.1 percent of chokes, 11 percent loss of consciousness. The publisher's page returned 403 on the accessed date",
      publisher: "PubMed, National Library of Medicine",
      url: "https://pubmed.ncbi.nlm.nih.gov/33347362/",
      accessed: "2026-09-25",
    },
    {
      title:
        "Physician Reviews and Analyzes All Choke Submissions in UFC History (26 December 2020): summary of the Stellpflug paper giving the per-choke percentages (guillotine 13.72, arm-in guillotine 9.73, triangle 8.83, arm triangle 8.19). Cited for those figures only",
      publisher: "Combat Sports Law",
      url: "https://combatsportslaw.com/2020/12/26/physician-reviews-and-analyzes-all-choke-submissions-in-ufc-history/",
      accessed: "2026-09-25",
    },
    {
      title:
        "Mańka-Malara K, Trzaskowski M. The Risk of Joint and Neck Injuries in Mixed Martial Arts: Grappling and Submission Techniques in Professional Fights. Journal of Clinical Medicine 2025. 2,488 UFC fights 2000 to 2021, 462 submissions, counts by technique, choke and arm-technique proportions, sex differences, two-researcher video verification",
      publisher: "PubMed Central, National Library of Medicine",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC12610064/",
      accessed: "2026-09-25",
    },
    {
      title:
        "2023 World Championships submission breakdown (20 June 2023): quarterfinals to finals, 128 matches, 47 submissions, 36.72 percent, choke from the back 21, armbar 10, triangle 4",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/news/2023-world-championships-submission-breakdown",
      accessed: "2026-09-25",
    },
    {
      title:
        "ADCC 2022 aftermath: data compilation and analysis. 40 submissions (41 with the superfight), 36 percent rate, 11 leg locks, 9 finishes by a guard player. The page answered a plain HTTP request but returned 403 to our fetch tool; per-technique counts are in a graphic and are not used",
      publisher: "BJJ Heroes",
      url: "https://www.bjjheroes.com/editorial/adcc-2022-after-math-data-compliation-and-analysis",
      accessed: "2026-09-25",
    },
  ],
  relatedSlugs: [
    "the-rear-naked-strangle-from-back-control",
    "the-guillotine-from-the-front-headlock",
    "why-sport-jiu-jitsu-does-not-transfer-directly-to-mma",
    "what-the-early-ufc-tournaments-demonstrated",
    "how-no-gi-rulesets-reshaped-technique-selection",
  ],
  contestedNotes: [
    "FightAlpha and GrapplerHQ disagree on the triangle (94 at 5.5 percent against 114 at 6.9 percent) in the direction a date difference cannot explain. Neither publishes its grouping rule for variants such as the triangle armbar, and the probable cause given here is our inference.",
    "Stellpflug et al. report percentages of chokes, not of submissions. The per-choke breakdown below the rear naked choke is taken from a third-party summary because the journal's page refused our request, and is marked as such.",
    "The BJJ Heroes ADCC 2022 page was reachable by plain request and not by our fetch tool. Only the figures legible in its page text are used; its per-technique chart is not.",
    "The reading of the top five techniques as three positions, and of the post-2011 shift as a move away from closed-guard finishes, is this article's interpretation. No dataset here records the position a submission was finished from.",
    "The five-technique share of about eighty percent is arithmetic on the cited tables (81.6, 83.1 and 79.4 percent). No source publishes it as a figure of its own.",
  ],
};
