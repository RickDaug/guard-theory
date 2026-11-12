import type { DraftArticle } from "../types.ts";

/**
 * A philosophy piece that takes a borrowed phrase back to where it can be
 * documented, and then asks what it has to do with the first belt.
 *
 * What is sourced: the book's title, publisher, opening line and author note,
 * from the publisher's page for the current edition; the first edition's
 * imprint, year, editor and introduction, from a library catalogue record; the
 * talk the book's prologue was made from, read as the audio transcript the San
 * Francisco Zen Center publishes; one scholar's essay on the older saying
 * attributed to Zeami; one academy's post as an example of the phrase in
 * jiu-jitsu writing; the white belt's formal position, from the IBJJF's
 * General System of Graduation, read from the PDF; and two eye-tracking
 * studies of the Einstellung effect in chess players, one read in the journal
 * and one in the authors' manuscript held by a university archive.
 *
 * The book itself was not read. It is described only as the publisher, the
 * catalogue and the Zen Center describe it, and the talk is reported as the
 * transcript gives it. Zeami was not read either; his saying is reported as
 * the essay gives it, in English.
 *
 * What is this site's own argument, labelled in the body and recorded in
 * contestedNotes: that the phrase is about attention before it is about
 * modesty; that the Einstellung studies describe something close to what the
 * talk describes, without flattering beginners; and that the white belt, as
 * the federation writes it, can neither confer nor remove the thing the
 * phrase names. None of it is evidence about jiu-jitsu, and the piece says so.
 *
 * The piece gives no advice about training or about anybody's state of mind.
 * It is consistent with leave-your-ego-at-the-door (a saying set beside a
 * research term), with the survival-first piece (the graduation document has
 * no curriculum) and with the piece on judo's two principles (a Japanese idea
 * reported only as its own institutions print it).
 *
 * Draft: no one has read and signed off this piece, so it carries no byline
 * and no date.
 */
export const beginnersMindAndTheWhiteBelt: DraftArticle = {
  status: "draft",
  slug: "beginners-mind-and-the-white-belt",
  category: "training-culture",
  title: "Beginner's mind, and what the white belt is for",
  metaTitle: "Beginner's mind and the white belt",
  standfirst:
    "Jiu-jitsu borrowed beginner's mind from a Zen talk and uses it as a word for humility. The talk is about something else, the nearest research is about chess, and the federation's white belt is comes with no requirement at all.",
  metaDescription:
    "Beginner's mind is used in jiu-jitsu as a word for humility. What the Zen talk said, what the white belt formally is, and what two chess studies found.",
  sections: [
    {
      id: "a-borrowed-phrase",
      heading: "A borrowed phrase",
      paragraphs: [
        "Beginner's mind is a phrase jiu-jitsu borrowed. A 2024 post on the site of Easton Training Center introduces the word shoshin, glosses it as beginner's mind, and puts it to work like this: \"A beginner's mind lets us leave our egos behind and allows us to learn from unconventional sources.\" Used that way it is a neighbour of the instruction to leave your ego at the door, and it means roughly the same thing: stay humble.",
        "This piece asks three things. Where does the English phrase come from, and what does its source say? What is the white belt, formally? And what has research on expertise found about knowing more and noticing less? Those can be sourced. The join between them is our argument and is labelled as ours. One academy's post is one post, and we make no claim about how many rooms use the phrase. Nothing here is advice.",
      ],
    },
    {
      id: "where-the-english-phrase-comes-from",
      heading: "Where the English phrase comes from",
      paragraphs: [
        "The best-known English source is a book. Shambhala Publications sells a fiftieth anniversary edition of Shunryu Suzuki's Zen Mind, Beginner's Mind, dated June 2, 2020, and quotes the opening line on its page: \"In the beginner's mind there are many possibilities, but in the expert's there are few.\" The publisher's author note describes Suzuki as a Japanese priest of the Soto lineage who taught in the United States from 1959 until his death in 1971, and as the founder of the San Francisco Zen Center.",
        "The San Francisco Public Library's catalogue record for the first edition gives the imprint as Walker/Weatherhill, New York, the year as 1970 and the length as 134 pages. It records that the book was edited by Trudy Dixon and has an introduction by Richard Baker. The Zen Center's lineage page describes Suzuki's books as collections of his edited talks. The famous sentence was spoken before it was printed.",
        "The Zen Center publishes the talk. A page in its online course on Suzuki's recovered recordings carries the audio transcript of a talk it lists as Tape #1 and dates 11/11/65, with a note that it \"formed the basis of the Prologue of the book\". In the transcript the sentence runs: \"In beginner's mind we have many possibilities, but in expert mind there is not much possibilities.\" The line the publisher quotes is tidier. We read the transcript and the publisher's page and not the book, so what follows describes the talk.",
      ],
    },
    {
      id: "what-the-talk-says",
      heading: "What the talk says",
      paragraphs: [
        "The talk supplies the word: \"'Shoshin' means beginner's mind. If we can keep beginner's mind always, that is the goal of our practice.\" Its example is repetition. The group had recited a sutra once that morning, and Suzuki asks what would happen if they recited it twice, three times, four times and more. His answer is that they would easily lose their original attitude in reciting it. Practice carried on for years, he says, takes on a pattern, and \"we will lose the limitless meaning of original mind\".",
        "Two other things in the transcript bear on the gym's use. Suzuki does not keep the idea inside Zen. Remaining a beginner is, he says, the secret of Zen and of various practices, and he names flower arrangement and Japanese singing. And there is a passage about claims to knowledge. His listeners should not say that they know what Zen is, or that they have attained enlightenment: \"We should be always beginner.\" That is as near as the talk comes to humility. It also ties beginner's mind to keeping the Buddhist precepts, which is outside anything this piece can use.",
        "An older Japanese saying is put into English with the same phrase. Keiichiro Tsuchiya, an emeritus professor at Meiji University, wrote in 2017 on the university's opinion site about \"Do not forget the beginner's mind\", which he gives as words of Zeami, the figure who brought Noh drama to its complete form. He says the saying \"is understood today as meaning that one must not forget the resolve with which one began to study something\", and argues that Zeami meant more by it: that there are \"many such instances during a single lifetime\", in youth, in middle age and in old age, each one the ingenuity needed to get past an obstacle. That is one scholar's essay, published with the university's note that it is the author's opinion. We did not read Zeami.",
      ],
    },
    {
      id: "what-the-white-belt-formally-is",
      heading: "What the white belt formally is",
      paragraphs: [
        "The IBJJF's General System of Graduation, in the June 2026 version, lists White first in both of its tables of belt ranks, the one for athletes aged 4 to 15 and the one for athletes of 16 and older. Under minimum ages it says \"White Belt: Any age.\" Under minimum periods for adults it says \"White Belt: No minimum time.\" Like the blue, purple and brown belts it is divided into four degrees, and Article 4.1.3 leaves the use of degrees up to brown belt at the professor's discretion.",
        "That is the whole of it. We searched the document's text for beginner, novice, humility, attitude and knowledge, and none of them appears. The federation defines the white belt by where it sits and attaches nothing to it: no age, no time, and, as our piece on survival first found of the same document, no content. Article 3.2.2 reads: \"The time taken to graduate the athlete from White Belt to Black Belt is at the professor's discretion.\"",
        "So the document has no answer to what the white belt is for. It is the rank a person holds before any requirement has been met. Any purpose beyond that is the room's, or the saying's.",
      ],
    },
    {
      id: "what-chess-experts-looked-at",
      heading: "What chess experts looked at",
      paragraphs: [
        "The research that sits nearest the opening line concerns what psychologists call the Einstellung effect, or mental set. Sheridan and Reingold, in PLOS ONE in 2013, describe it as the finding that \"the presence of a familiar solution can block the discovery of better solutions\". Chess has been a common setting for studying it in experts, because skill there is rated on a scale.",
        "Bilalic, McLeod and Gobet published an eye-tracking study in Cognition in 2008, which we read in the authors' manuscript in Brunel University's research archive. Its first experiment used Candidate Masters, in two groups of five by the manuscript's table. One chess problem had two ways to win: a well-known mating pattern taking five moves, and a less familiar mate in three. Players were asked for the shortest win. The group shown a version with only the three-move solution all found it, in 79 seconds on average. The group shown both all said the five-move mate was the shortest, after 37 seconds on average, and all reported that they had then looked for something shorter.",
        "The eye tracker showed where they had looked. They kept returning to the squares that mattered for the familiar solution for as long as they worked on the problem. The authors' summary is: \"People think they are considering the evidence in an open-minded way, not realising that their attention is being selectively directed to only certain aspects of the problem.\" The manuscript also reports the same group's earlier study, which we did not read, as finding that a familiar solution \"reduced the problem solving performance of the experts to that of players about three standard deviations lower in skill\".",
      ],
    },
    {
      id: "what-the-novices-did",
      heading: "What the novices did",
      paragraphs: [
        "Read alone, that looks like the opening line with a measurement attached. The second study complicates it. Sheridan and Reingold tested 34 players: 17 experts with a mean Canadian federation rating of 2223, and 17 unrated but active club players, whom the paper calls novices. On the one problem where the familiar move was good but not best, 8 of the 17 in each group chose it. In the paper's words, \"an equal proportion of novices and experts selected the suboptimal Einstellung move\".",
        "The players who chose it, expert and novice alike, went on looking at that corner of the board throughout. The players whose gaze moved away were the nine experts who found the better move. On three further problems where the familiar move was a blunder, all of the experts and the majority of the novices avoided it. The authors suggest, as a possibility, that a blunder gives a player feedback that a merely good move does not.",
        "The Cognition manuscript makes the same point about skill: \"The ability to resist the Einstellung effect and find the optimal solution in any given problem is greater the more skilful the player.\" It adds that the effect can still be shown at any level if the problem is hard enough.",
        "The limits are plain. One experiment had ten players. The other had 34 and a single problem of the critical kind. The novices were club players, not people new to the game. Every task was a chess position on a screen.",
      ],
    },
    {
      id: "attention-not-modesty",
      heading: "Attention, not modesty",
      paragraphs: [
        "This section is our argument. No source above makes it.",
        "Read from the transcript, beginner's mind is first a claim about attention: what happens to the way a person meets something by the fourth recitation. Modesty is in the talk, in the passage about not saying \"I know\", and the gym's use of the phrase makes that passage the whole of it. We think the weight sits elsewhere. A person can be entirely modest about their rank and still see only the pattern they already know.",
        "The chess studies are about that second thing. A familiar answer holds the eye while its owner believes the search is still open. They do not, however, favour the beginner. The novices were caught as often as the experts, the players who got free were experts, and more skill meant more resistance. If the phrase is taken to mean that knowing less is an advantage, those two papers are against it. If it is taken as Suzuki's sutra example, about the pattern a repeated thing acquires, they describe something close to it. The resemblance is ours. Neither paper mentions Zen, and the talk is not a hypothesis about eye movements.",
        "That leaves the white belt. By the federation's document it is an empty rank, and the beginner's mind of the talk is not a property of beginners. Suzuki calls keeping it the most difficult thing, and Tsuchiya's Zeami finds it in old age. On that reading the belt neither confers it nor takes it away. Our piece on leaving your ego at the door found a saying and a research term that shared a word and not a subject. Here the phrase and the research come nearer to sharing a subject, and jiu-jitsu is in neither. No study cited here involved grappling, and nothing in this piece is evidence that an experienced grappler sees fewer options than a new one.",
      ],
    },
  ],
  sources: [
    {
      title:
        "Zen Mind, Beginner's Mind: 50th Anniversary Edition, by Shunryu Suzuki (June 2, 2020): the publisher's product page, including the book description that quotes the opening line and the author note",
      publisher: "Shambhala Publications",
      url: "https://www.shambhala.com/products/zen-mind-beginners-mind-50th-anniversary-edition",
      accessed: "2026-11-11",
    },
    {
      title:
        "Zen mind, beginner's mind, by Shunryu Suzuki, edited by Trudy Dixon, with an introduction by Richard Baker (New York: Walker/Weatherhill, 1970, 1st ed., 134 p.): catalogue record",
      publisher: "San Francisco Public Library",
      url: "https://sfpl.bibliocommons.com/v2/record/S93C1253119",
      accessed: "2026-11-11",
    },
    {
      title:
        "San Francisco Zen Center Lineage: the entry on Shunryu Suzuki Roshi, which describes his books as collections of his edited talks",
      publisher: "San Francisco Zen Center",
      url: "https://www.sfzc.org/about-san-francisco-zen-center/san-francisco-zen-center-lineage/",
      accessed: "2026-11-11",
    },
    {
      title:
        "Shunryu Suzuki: \"Beginner's Mind\" - Talk and Transcripts (Tape #1, dated 11/11/65), in the online course Awakening the Archive: The Lost Talks of Suzuki Roshi. The audio transcript and the page's note on the book's Prologue",
      publisher: "San Francisco Zen Center (SFZC Online)",
      url: "https://learn.sfzc.org/courses/awakening-the-archive/lectures/37853514",
      accessed: "2026-11-11",
    },
    {
      title:
        "Keiichiro Tsuchiya, \"'The beginner's mind is found many times in a lifetime': the true meaning of Zeami's words\" (April 14, 2017). An opinion essay; the page states that it does not represent the university's official view",
      publisher: "Meiji.net, Meiji University",
      url: "https://english-meiji.net/articles/156/",
      accessed: "2026-11-11",
    },
    {
      title:
        "Ben Williamsen, \"Find Guidance Anywhere With Shoshin Mindset\" (June 28, 2024). An academy's blog post, cited as one example of the phrase in jiu-jitsu writing and for nothing beyond it",
      publisher: "Easton Training Center",
      url: "https://eastonbjj.com/mixed-martial-arts/find-guidance-anywhere-with-shoshin-mindset/",
      accessed: "2026-11-11",
    },
    {
      title:
        "IBJJF General System of Graduation, June 2026 (PDF linked from the federation's graduation page): Articles 1.1, 1.2, 2.1, 3.1, 3.2.2 and 4.1, and the document as a whole",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/graduation-system",
      accessed: "2026-11-11",
    },
    {
      title:
        "Merim Bilalic, Peter McLeod and Fernand Gobet, \"Why good thoughts block better ones: The mechanism of the pernicious Einstellung (set) effect\", Cognition 108, 652-661 (2008). Read as the authors' manuscript, marked in press, deposited in the university's archive",
      publisher: "Brunel University Research Archive (BURA)",
      url: "https://bura.brunel.ac.uk/handle/2438/2276",
      accessed: "2026-11-11",
    },
    {
      title:
        "Heather Sheridan and Eyal M. Reingold, \"The Mechanisms and Boundary Conditions of the Einstellung Effect in Chess: Evidence from Eye Movements\", PLoS ONE 8(10), e75796 (2013)",
      publisher: "PLOS ONE",
      url: "https://doi.org/10.1371/journal.pone.0075796",
      accessed: "2026-11-11",
    },
  ],
  relatedSlugs: [
    "leave-your-ego-at-the-door",
    "survival-first-and-the-order-things-are-learned-in",
    "maximum-efficiency-and-mutual-welfare",
  ],
  contestedNotes: [
    "The book was not read for this piece. Its opening line is quoted from the publisher's page, its first-edition details from a library catalogue record, and its relation to the 1965 talk from the San Francisco Zen Center's note on the transcript. One Zen Center page, describing a later book, gives the year of Zen Mind, Beginner's Mind as 1972; the catalogue record for the first edition gives 1970, and that is the year used here.",
    "The talk is reported from the audio transcript the Zen Center publishes, which marks two blank spaces in the passage about practice acquiring a pattern. The paraphrase of that passage follows the words that are there. The talk's remarks on the Buddhist precepts are mentioned and not interpreted.",
    "The statement that beginner's mind is about attention before it is about modesty is this site's reading. The transcript does contain a passage against saying \"I know what is Zen\", and a reader could fairly weigh that passage more heavily than we do. This piece does not speak for Zen teaching.",
    "The essay by Keiichiro Tsuchiya gives Zeami's saying only in English and is an opinion piece. We did not read Zeami, and we do not assert that the Japanese word in his saying is used in the same sense as in Suzuki's talk.",
    "One academy's blog post is cited as an example of the phrase in jiu-jitsu writing. It is evidence about that post only. No survey of how gyms use the phrase was located or attempted.",
    "The search of the IBJJF's General System of Graduation covers the text of one PDF on one day. That the document attaches no stated purpose to the white belt is a description of that document, not a claim about what any professor teaches.",
    "The Cognition study was read as the authors' manuscript, marked in press, not as the published article; the group sizes are taken from a table in that manuscript. The three-standard-deviation figure comes from an earlier study by the same authors, reported here at second hand as the manuscript summarises it.",
    "The two eye-tracking studies involve ten and 34 chess players, all working on positions shown on a screen, and the novices in the second were active club players. Setting them beside the Zen talk is this site's comparison; neither paper mentions Zen. Nothing in them is evidence about jiu-jitsu, about beginners in any sport, or about how anybody should train.",
  ],
};
