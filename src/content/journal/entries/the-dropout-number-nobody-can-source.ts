import type { PublishedArticle } from "../types.ts";

/**
 * The house method applied to the sport's most-repeated statistic. Every figure
 * quoted here is attributed in the same sentence it appears in, because the
 * failure mode of a piece like this is to launder the number while debunking
 * it. The article ends without an answer, which is the finding.
 */
export const theDropoutNumberNobodyCanSource: PublishedArticle = {
  status: "published",
  publishedAt: "2026-08-04",
  authorId: "rick-r",
  slug: "the-dropout-number-nobody-can-source",
  category: "training-culture",
  title: "The dropout number nobody can source",
  standfirst:
    "Ninety per cent of white belts quit, or seventy, or seventy-five, or ninety-five, depending on which page you landed on, and following each version back to its origin is more instructive than any of them.",
  metaDescription:
    "Ninety per cent of white belts quit - or seventy, or seventy-five, depending on the page. Following each number back to its origin is the instructive part.",
  sections: [
    {
      id: "five-numbers-one-claim",
      heading: "Five numbers, one claim",
      paragraphs: [
        "Somebody in your gym has said it. Most white belts quit. The figure attached to it is usually ninety per cent, delivered with the flatness of something everybody knows.",
        "Here is what is actually in circulation, quoted with its owner attached. BJJ Fanatics writes that it would be generous to say three out of every ten white belts move on to blue, which it converts into over seventy per cent quitting. HeavyBJJ states that on average over seventy-five per cent of white belts quit, and publishes a table putting white belt at seventy-five per cent, blue at fifty, purple at six, brown at three and black at one. Jiu Jitsu Haus puts roughly ninety per cent quitting before blue, fifty to seventy per cent before purple, twenty to thirty per cent at purple, about ten per cent at brown, and concludes that only one to three per cent of people who start ever earn a black belt. A Substack post is titled with ninety-five per cent. BJJ Analytics publishes a cumulative series: fifty per cent in the first six months, seventy-five at white, eighty-five at blue, ninety-two at purple and ninety-seven at brown.",
        "Those are not five reports of one measurement. They are five different quantities with five different shapes, and two of them are not even about the same event. A figure for quitting before blue belt and a figure for quitting before black belt are different claims, and they get swapped for one another constantly, usually by whoever is quoting them next.",
      ],
    },
    {
      id: "following-each-one-home",
      heading: "Following each one home",
      paragraphs: [
        "The useful exercise is not deciding which figure is right. It is opening each page and reading what it says about where its number came from.",
        "BJJ Fanatics is the most honest of them, and says so in the sentence immediately before the number: it is hard to measure the actual figure of how many white belts quit. What follows is explicitly a generous guess, converted into a percentage by subtraction. Nothing was counted.",
        "HeavyBJJ does count something. The page describes a total of 221 students of whom 53 reached blue belt, which it renders as roughly seventy-six per cent quitting, and states that the wider table is made of estimates based on a survey at the author's gym and information from his coaches. That is one room, one coach's records, and an honest label on it. It is also, elsewhere on the same page, a comparison table putting BJJ at ninety-nine per cent dropout against judo at seventy-five and karate at fifty, with no source given for any of the five figures in it.",
        "Jiu Jitsu Haus gives no source for its belt-by-belt series at all, and works an example from a round three million practitioners worldwide. BJJ Analytics, the most-cited quantitative page in this space, carries one line about provenance under each chart: data compiled from IBJJF, surveys, and industry research. There is no sample size, no survey instrument, no date range, no definition of a practitioner, and no explanation of how a federation's competition registrations could produce a retention rate for people who never competed. Its headline figure is five million practitioners.",
        "So the honest inventory is one guess, one gym's records, one unsourced series, one uncited total, and one aggregate whose method is a sentence fragment. That is the entire evidentiary base for a number people repeat as though it came out of a register.",
      ],
    },
    {
      id: "what-a-retention-rate-requires",
      heading: "What a retention rate would actually require",
      paragraphs: [
        "It is worth being specific about what is missing, because the gap is not a matter of somebody needing to run a bigger survey.",
        "A retention rate needs three things. A denominator: a defined population of people who started, counted at the moment they started rather than reconstructed afterwards from whoever is still around. A time window: quitting within six months and quitting within six years are different events, and a figure without a window can mean either. And a definition of quitting that survives contact with how people actually train, which includes moving city, taking two years off for a child, training at home, switching to judo, or drifting away without ever deciding to.",
        "None of the pages above has a denominator. Every one of them is describing the people who remained and inferring the people who left, which is the structure of a survivorship problem rather than a measurement. A gym that has been open six years and has forty members knows how many members it has. Whether it knows how many people ever walked in and paid for a month depends entirely on how it kept its books.",
      ],
    },
    {
      id: "what-the-belt-system-actually-bounds",
      heading: "What the belt system actually bounds",
      paragraphs: [
        "There is one hard document in this area, and it does not measure retention. It constrains it from one side.",
        "The IBJJF's General System of Graduation, in the June 2026 version, sets minimum periods for adult ranks. White belt has no minimum. Blue belt is two years, purple a year and a half, brown a year, with named exceptions that reduce or remove the minimum for certain juvenile and world-champion histories. Those periods are counted from the day the athlete completes registration of each rank with the federation, and the document is explicit that the time from white to black is at the professor's discretion while the federation will only recognise a graduation that meets the mandatory minimums.",
        "Add the adult minimums and you get four and a half years of registered time from blue belt onward, with the white belt period unbounded. That tells you something real: any claim that a typical black belt takes about a decade is at least consistent with the rules, and any claim of a much faster route through the ranks is not, for registration purposes.",
        "What it does not tell you is how many people started. A promotion rate is not a quit rate. You can know exactly how long a rank takes and know nothing at all about how many people abandoned the attempt, because the people who left were never registered as anything.",
      ],
    },
    {
      id: "what-a-serious-count-looks-like",
      heading: "What a serious count looks like in this sport",
      paragraphs: [
        "It helps to see what a properly designed attempt at counting something in jiu-jitsu looks like, and how much it still concedes.",
        "Stegerhoek and colleagues published a cross-sectional study of injury prevalence in BJJ in BMJ Open Sport and Exercise Medicine in 2025. It reached 881 participants, of whom 817, or ninety per cent, were male, with an average age of 30.8 years. It was a retrospective survey distributed online and via posters at Dutch competitions, collecting data on the previous twelve months, over a data collection window of one month in early 2024. The paper defines what counts as an injury in advance, reports confidence intervals, and closes by recommending that future studies follow practitioners prospectively, because a retrospective survey cannot establish cause.",
        "That is a real study, and it is about the easier question. It still recruits people who were present to be recruited, still relies on memory, and still cannot say what fraction of everyone who ever trained it represents. If that is what careful looks like for injury, a retention figure produced from unspecified surveys and industry research is not in the same category of claim.",
      ],
    },
    {
      id: "the-youth-sport-literature",
      heading: "The literature that does exist, and why it does not transfer",
      paragraphs: [
        "Sport dropout has been studied seriously, just not here. Crane and Temple published a systematic review in European Physical Education Review in 2015 that screened 557 studies and included 43. Five areas emerged as associated with dropping out: lack of enjoyment, perceptions of competence, social pressures, competing priorities, and physical factors including maturation and injuries. The review found intrapersonal and interpersonal constraints more frequently associated with dropout than structural ones.",
        "Read the sample description before borrowing any of that. Most of the included studies focused solely on adolescents, eighty-nine per cent of participants were male, most were cross-sectional, and the best-represented sports were soccer, swimming, gymnastics and basketball. An adult who joins a martial arts gym at thirty-two, pays monthly, and answers to nobody about attendance is not the population that literature describes. The reasons may well overlap. The rates cannot be carried across, and nothing in that review licenses a percentage for jiu-jitsu.",
      ],
    },
    {
      id: "the-answer-we-can-defend",
      heading: "The answer we can defend",
      paragraphs: [
        "We do not know what fraction of people who start jiu-jitsu stop, and neither does anybody who has published a figure. That is the finding, and it is not a rhetorical flourish. No page examined for this article named a defined starting population, a time window and a definition of quitting, and without those three things the number being reported is not a rate.",
        "Two things are supportable. Attrition is high enough that every gym owner recognises the description, which is evidence of a phenomenon and not a measurement of it. And the graduation rules bound how quickly anybody can be recognised at each rank, which makes the pipeline long by design regardless of who leaves.",
        "The practical use of all this is narrow and worth having. When somebody quotes you a dropout figure, the question is not whether it sounds right. It is what the denominator was, over what window, and who counted. If the answer is a page that says data compiled from surveys and industry research, you have learned what the page is, and the number should not survive the sentence you use it in.",
      ],
    },
  ],
  sources: [
    {
      title:
        "IBJJF General System of Graduation, June 2026: minimum periods 3.1.3 and observations 3.2.1-3.2.2",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/graduation-system",
      accessed: "2026-08-03",
    },
    {
      title:
        "BJJ Belt Statistics: belt distribution, average time at each belt and cumulative dropout rates",
      publisher: "BJJ Analytics",
      url: "https://www.bjjanalytics.com/belt-statistics",
      accessed: "2026-08-03",
    },
    {
      title: "What percentage of BJJ white belts quit?",
      publisher: "BJJ Fanatics",
      url: "https://bjjfanatics.com/blogs/news/what-percentage-of-bjj-white-belts-quit",
      accessed: "2026-08-03",
    },
    {
      title:
        "This is why the majority of people will quit Brazilian jiu-jitsu at white and blue belt",
      publisher: "HeavyBJJ",
      url: "https://heavybjj.com/this-is-why-majority-of-people-will-quit-brazilian-jiu-jitsu-at-white-and-blue-belt/",
      accessed: "2026-08-03",
    },
    {
      title:
        "The rarity of the Brazilian jiu-jitsu black belt: numbers, dropouts, and the journey of a lifetime",
      publisher: "Jiu Jitsu Haus",
      url: "https://jiujitsuhaus.com/the-rarity-of-the-brazilian-jiu-jitsu-black-belt-numbers-dropouts-and-the-journey-of-a-lifetime/",
      accessed: "2026-08-03",
    },
    {
      title: "Why do 95% of people quit BJJ before getting a black belt?",
      publisher: "MMA-JiuJitsu (Substack)",
      url: "https://mmajiujitsu.substack.com/p/why-do-95-of-people-quit-bjj-before",
      accessed: "2026-08-03",
    },
    {
      title:
        "Jeff Crane and Viviene Temple, A Systematic Review of Dropout from Organized Sport among Children and Youth, European Physical Education Review 21(1), 114-131 (2015)",
      publisher: "ERIC, Institute of Education Sciences",
      url: "https://eric.ed.gov/?id=EJ1050586",
      accessed: "2026-08-03",
    },
    {
      title:
        "Injury prevalence among Brazilian Jiu-Jitsu practitioners globally: a cross-sectional study in 881 participants, BMJ Open Sport and Exercise Medicine 11(1), e002322 (2025)",
      publisher: "BMJ, via PubMed Central",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11907054/",
      accessed: "2026-08-03",
    },
  ],
  relatedSlugs: [
    "drilling-rehearsing-and-positional-sparring",
    "how-no-gi-rulesets-reshaped-technique-selection",
  ],
  contestedNotes: [
    "No figure in this article is endorsed. The percentages quoted from BJJ Fanatics, HeavyBJJ, Jiu Jitsu Haus, the MMA-JiuJitsu Substack and BJJ Analytics are reported as evidence of what circulates, attributed in the sentence they appear in, and each is accompanied by what that page says about its own method. Guard Theory makes no claim about the true rate.",
    "BJJ Analytics states only that its data is compiled from IBJJF, surveys, and industry research. No sample size, survey instrument, date range or definition of a practitioner is published on the page, and the mechanism by which federation records could yield a retention rate for non-competitors is not explained. It is treated here as the object of study rather than as a source.",
    "HeavyBJJ labels its own belt-level table as estimates based on a survey at the author's gym and information from his coaches, and separately publishes a cross-martial-art dropout comparison with no source for any figure in it. The two are not equivalent in reliability and are described separately in the text.",
    "The IBJJF minimum periods bound how quickly a rank can be recognised. They are not a measure of retention, and this article does not treat a promotion timeline as a quit rate.",
    "Crane and Temple reviewed organised youth sport, with most included studies focused solely on adolescents and 89 per cent of participants male. Transfer to adult recreational martial arts is limited, and no rate from that literature is applied to jiu-jitsu here.",
  ],
};
