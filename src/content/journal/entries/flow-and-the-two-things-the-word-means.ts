import type { DraftArticle } from "../types.ts";

/**
 * A philosophy piece about one word doing two jobs: flow as a kind of round
 * and flow as a psychological state.
 *
 * What is sourced: every statement about how the flow roll is defined (five
 * pages by named instructors, academies and one retailer's blog, each quoted
 * as itself); the absence of the term from the IBJJF Rule Book, read from the
 * PDF; the account of the psychological construct (a 2022 scoping review and a
 * 2020 conceptual analysis, both in Frontiers in Psychology, and the accepted
 * manuscript of a 2012 systematic review of flow in elite sport); and two
 * combat-sport studies, one of jiu-jitsu practitioners and one of judoka, read
 * from their PDFs. Csikszentmihalyi's own books were not read; the piece says
 * so and reports the theory as the reviews describe it.
 *
 * What is ours, and labelled as ours: the placing of the flow roll between
 * rehearsal and sparring, the remark that the word has a third and looser use,
 * and the whole final section, which argues that the round and the state
 * share a word and that neither guarantees the other.
 *
 * The piece gives no advice about training or about anybody's state of mind,
 * and makes no medical, mental-health, safety or performance claim. Safety and
 * injury wording that appears on the academy pages is deliberately not
 * reproduced. It is consistent with the drilling piece (rehearsal against
 * positional sparring) and with leave-your-ego-at-the-door (a word shared by
 * the gym and the research literature, for different subjects).
 *
 * Draft: no one has read and signed off this piece, so it carries no byline
 * and no date.
 */
export const flowAndTheTwoThingsTheWordMeans: DraftArticle = {
  status: "draft",
  slug: "flow-and-the-two-things-the-word-means",
  category: "training-culture",
  title: "Flow, and the two things the word means",
  standfirst:
    "Jiu-jitsu uses flow for a kind of round, and psychology uses it for a state of mind. Gyms define the first and a contested research literature defines the second, and one does not guarantee the other.",
  metaDescription:
    "Jiu-jitsu calls a low-resistance round a flow roll. Psychology calls a state of absorption flow. The two share a word, and one does not guarantee the other.",
  sections: [
    {
      id: "one-word-two-jobs",
      heading: "One word, two jobs",
      paragraphs: [
        "Flow is used in jiu-jitsu rooms for two different things. One is a kind of round: the flow roll, in which two partners move through positions at low resistance and let submissions go. The other is a state of mind, the one Mihaly Csikszentmihalyi introduced to psychology in 1975, in which a person is absorbed in what they are doing.",
        "The first is a training convention and the second is a research construct. This piece takes each on its own terms: who defines the flow roll, what the psychology literature says the state is and how well it has been measured, and what has been studied on a mat. The last section is our argument, labelled as ours. Nothing here is advice about training or about anybody's state of mind.",
      ],
    },
    {
      id: "the-flow-roll-as-its-teachers-define-it",
      heading: "The flow roll, as the people who teach it define it",
      paragraphs: [
        "Stephan Kesting's instructional site Grapplearts published a page in January 2025 headed How to Flow Roll. It calls flow rolling \"a type of BJJ sparring\" and gives the rules as set out by Jesse Walker, a black belt from Rough Hands BJJ in Louisville, Kentucky. There are three. The first is no explosive motion, with everything slow and controlled. The second: \"No using strength to solve problems\". The third: \"Keep it moving and don't park anywhere for more than three seconds\".",
        "Easton Training Center, a group of academies in Colorado, published its own account in August 2024 under Shawn Folmar's name. \"Simply put, flow rolling is the catch and release of Brazilian Jiu Jitsu.\" The submission is part of the round and the finish is not: \"When you catch your partner in a submission, you never fully lock it, so they too can move, escape and transition.\"",
        "Evolve MMA, on its blog in July 2024, puts the weight on resistance: \"Flowing is a type of BJJ sparring where both partners offer minimal resistance to the other's techniques instead of trying to tap each other out.\" It adds that \"there are no winners and losers when you flow\".",
        "The three accounts agree on the outline: the round is unscripted, both people keep moving, resistance is turned down and nothing is finished. Our piece on drilling separated rehearsal against a compliant partner from positional sparring, in which both people are trying. On these descriptions a flow roll sits between the two. An article on the BJJ Fanatics blog from December 2018 places it in the same spot, as \"basically a step between drilling a move in class and a normal roll\".",
      ],
    },
    {
      id: "no-rule-book-defines-it",
      heading: "No rule book defines it",
      paragraphs: [
        "None of these pages cites a rule, and we found none to cite. The IBJJF Rule Book, version 6.1, governs competition. In a search of its text the word flow appears once, in the article on penalties, which referees award \"with the aim of assuring the match flows properly\". The words sparring and training do not appear. That is one federation's book. A flow roll is a convention of the training room, and its terms are whatever a room, or two partners, say they are.",
        "The people who write about it say as much. The BJJ Fanatics article again: \"There seems to be a variety of definitions of what flow rolling is. Some would assert that it is rolling with zero resistance.\" Others, it goes on, allow light resistance. Easton's account says the idea \"requires a certain level of skill to do effectively\", which amounts to saying that the easy round is not easy to do.",
        "The word also slides. An earlier Evolve MMA article, from January 2018, uses flow for something that is not a round at all: \"Learning to relax, or flow, while rolling ranks among the most difficult BJJ skills to develop.\" There it names a manner of moving inside an ordinary roll, a third and looser use. Five pages are five pages, and we make no claim about how common any version is.",
      ],
    },
    {
      id: "flow-as-a-state",
      heading: "Flow as a state",
      paragraphs: [
        "Csikszentmihalyi's books were not read for this piece. What follows is the account given in a 2022 scoping review by Peifer and thirteen colleagues in Frontiers in Psychology, which covered 252 studies published between 2000 and 2016.",
        "The review opens with a definition it takes from the European Flow-Researchers' Network. Flow \"is a gratifying state of deep involvement and absorption that individuals report when facing a challenging activity and they perceive adequate abilities to cope with it\". It then lists nine characteristics attributed to Csikszentmihalyi: challenge-skill balance, merging of action and awareness, clear goals, unambiguous feedback, concentration on the task, sense of control, loss of self-consciousness, time transformation and autotelic experience, the last meaning that the activity is rewarding in itself.",
        "The first of the nine has had the most attention. In the original model, as the review describes it, flow occurs when a person's skills meet the challenges of the situation. Later versions said it occurs when both are high and in balance. Later authors also sorted the nine into two groups. The balance of demands and skills, clear goals and clear feedback became preconditions. The other six became the experience itself. On this account challenge is in the definition, and its balance with skill is what the review calls a central precondition.",
      ],
    },
    {
      id: "what-measuring-it-has-turned-up",
      heading: "What measuring it has turned up",
      paragraphs: [
        "The construct is less settled than that summary suggests. In 2020 Sami Abuhamdeh published a conceptual analysis in the same journal that looked at how flow had been measured in 42 studies from the preceding five years. It had been measured in 24 distinct ways. Seventeen of the 42 left enjoyment out. Most of the commonly used scales, he writes, mix statements about the experience with statements about the conditions said to produce it.",
        "Two of his points bear on challenge and skill. The first is that the balance alone is a poor proxy. Citing a 2008 study, he writes that flow as measured by one common scale \"is not always optimized by a balance of challenges and skills\", and that sorting experience by challenge and skill often results in a quarter or more of daily life being counted as flow. The second is that most of the studies treated flow as a matter of degree, where Csikszentmihalyi, on Abuhamdeh's reading, described a distinct state that occurs relatively rarely. He calls low flow \"a contradiction in terms\". This is one author arguing for one position, and the scoping review notes that other conceptualisations exist.",
        "In sport the evidence leans on interviews. A 2012 systematic review by Swann, Keegan, Piggott and Crust found 17 empirical studies of flow in elite sport published between 1992 and 2011, with primarily qualitative findings. One study it reports found that 81 per cent of 16 national champion figure skaters perceived flow to occur only on rare occasions. The reviewers state their limits: athletes were often describing an experience they had chosen themselves, sometimes months or years afterwards, and every sample was elite. The scoping review adds that many of its studies were correlational and that causal interpretation of such data is not possible.",
      ],
    },
    {
      id: "flow-on-the-mat",
      heading: "Flow on the mat, as far as it has been studied",
      paragraphs: [
        "One study has asked jiu-jitsu practitioners about flow directly. Kohoutkova, Masaryk and Reguli, of Masaryk University in Brno, published it in Ido Movement for Culture in 2018. They collected 136 usable responses online, through Facebook groups, from practitioners aged 16 to 56, white belt to black. Each answered the nine-statement short form of a standard questionnaire on a five-point scale, three times over: once for learning a new technique, once for drill exercises and once for rolling.",
        "All nine dimensions differed across the three parts of training. Rolling and drilling differed on seven of the nine, challenge-skill balance among them. The paper's text does not say in words which part scored higher, and we have not taken figures from its table. The questionnaire asks about general experience of an activity, recalled, and not about a particular round. And rolling in this paper is \"a real simulation of fight or match\", with both partners trying to make the other submit. The flow roll was not one of the three parts, and the authors say a bigger sample would make the results more valuable.",
        "A second study comes from judo and uses a different model. Kellermann, Collins, MacPherson and Bertollo interviewed six high-level British judoka for a 2024 paper in the European Journal of Sport Science. The model sorts performance into four types, and its Type 1, optimal performance that feels effortless and automatic, is the one the paper describes as flow-like. Five of the six said they experienced it rarely. The athletes saw it, in the authors' words, as \"not too relevant, realistic, or even desirable in judo, considering the high task demands\". The type that resonated most was the second, optimal but effortful. The authors do not offer six retrospective interviews as generalisable, and neither do we.",
      ],
    },
    {
      id: "two-things-that-share-a-word",
      heading: "Two things that share a word",
      paragraphs: [
        "What follows is this site's argument. No study read for this piece examined a flow roll, and none of the five pages that describe the flow roll mentions the research.",
        "The flow roll is defined by what is taken out: explosive movement, strength, resistance and the finish, and with them most of what makes a round hard to win. The state is defined as something a person reports when facing a challenging activity with abilities adequate to it. One is built by lowering the challenge on purpose. The other is described as needing challenge to meet skill. Nothing in either description makes the first a route to the second.",
        "It does not follow that a flow roll rules the state out. Challenge in the theory is something a person perceives, and a round can be demanding in ways that have nothing to do with force. Keeping moving and solving problems without strength is, on our reading, a task with a clear goal and immediate feedback, and Easton's writer says it takes skill to do at all. Whether that adds up to the balance the theory describes cannot be read off a description, and Abuhamdeh's caution is that the balance was not a reliable sign of the state even where it had been measured.",
        "Nor does a hard round deliver it. The judoka in the interview study said the effortless state was rare for them. The research read here gives no ground for saying which kind of round, if either, is likelier to produce absorption.",
        "So the two uses share a picture, movement that does not stop, and not a mechanism. A flow roll is a set of constraints two people agree to, and it can be described from the outside. Flow in the psychological sense is a report from the inside, which its own researchers measured in two dozen ways across 42 studies. A room can schedule the first. Whether a flow roll does anything for the second has not been tested in anything we found. Our piece on leaving the ego at the door met the same situation with a different word.",
      ],
    },
  ],
  sources: [
    {
      title:
        "Stephan Kesting, \"How to Flow Roll\", dated January 2, 2025: the three rules attributed to Jesse Walker of Rough Hands BJJ. Cited as one instructor's published definition",
      publisher: "Grapplearts",
      url: "https://www.grapplearts.com/how-to-flow-roll/",
      accessed: "2026-11-11",
    },
    {
      title:
        "Shawn Folmar, \"Flow Roll: The Essence of Flowing, in Life and On the Mats\", dated August 23, 2024. Cited as one academy group's published account",
      publisher: "Easton Training Center",
      url: "https://eastonbjj.com/brazilian-jiu-jitsu/flow-roll-the-essence-of-flowing-in-life-and-on-the-mats/",
      accessed: "2026-11-11",
    },
    {
      title:
        "\"The Importance Of Flow Rolling In BJJ: Enhancing Skill Through Cooperative Training\", published July 4, 2024. Cited for its definition of flowing and for nothing beyond it",
      publisher: "Evolve MMA (Evolve Daily)",
      url: "https://evolve-mma.com/blog/the-importance-of-flow-rolling-in-bjj-enhancing-skill-through-cooperative-training/",
      accessed: "2026-11-11",
    },
    {
      title:
        "\"The Art Of Flow: Learning To Relax In Brazilian Jiu-Jitsu\", published January 5, 2018. Cited only for its use of the word flow to mean relaxing while rolling",
      publisher: "Evolve MMA (Evolve Daily)",
      url: "https://evolve-mma.com/blog/the-art-of-flow-learning-to-relax-in-brazilian-jiu-jitsu/",
      accessed: "2026-11-11",
    },
    {
      title:
        "\"Is Flow Rolling A Waste Of Time?\", posted by Fanatics Authors on December 14, 2018. A retailer's blog, cited for its statement that definitions vary",
      publisher: "BJJ Fanatics",
      url: "https://bjjfanatics.com/blogs/news/is-flow-rolling-a-waste-of-time",
      accessed: "2026-11-11",
    },
    {
      title:
        "IBJJF Rule Book, version 6.1 (2024JUN_IBJJF_Rules_EN.pdf, linked from the federation's books page): Article 7 and a text search of the whole document",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/books-videos",
      accessed: "2026-11-11",
    },
    {
      title:
        "Corinna Peifer, Gina Wolters, Laszlo Harmat, Jean Heutte, Jasmine Tan, Teresa Freire, Dionisia Tavares, Carla Fonte, Frans Orsted Andersen, Jef van den Hout, Milija Simlesa, Linda Pola, Lucia Ceja and Stefano Triberti, \"A Scoping Review of Flow Research\", Frontiers in Psychology 13, 815665 (2022), DOI 10.3389/fpsyg.2022.815665",
      publisher: "PubMed Central",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC9022035/",
      accessed: "2026-11-11",
    },
    {
      title:
        "Sami Abuhamdeh, \"Investigating the 'Flow' Experience: Key Conceptual and Operational Issues\", Frontiers in Psychology 11, 158 (2020), DOI 10.3389/fpsyg.2020.00158",
      publisher: "PubMed Central",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7033418/",
      accessed: "2026-11-11",
    },
    {
      title:
        "Christian Swann, Richard J. Keegan, David Piggott and Lee Crust, \"A systematic review of the experience, occurrence, and controllability of flow states in elite sport\", Psychology of Sport and Exercise 13(6), 807-819 (2012), DOI 10.1016/j.psychsport.2012.05.006; read in the accepted manuscript held by the repository",
      publisher: "Leeds Beckett University Repository",
      url: "https://eprints.leedsbeckett.ac.uk/id/eprint/273/",
      accessed: "2026-11-11",
    },
    {
      title:
        "Jindriska Kohoutkova, Pavol Masaryk and Zdenko Reguli, \"The Experience of the State of Flow in Brazilian Jiu-Jitsu\", Ido Movement for Culture. Journal of Martial Arts Anthropology 18(3), 1-6 (2018), DOI 10.14589/ido.18.3.1",
      publisher: "Idokan Poland Association",
      url: "https://doi.org/10.14589/ido.18.3.1",
      accessed: "2026-11-11",
    },
    {
      title:
        "Bernadette Kellermann, Dave Collins, Alan MacPherson and Maurizio Bertollo, \"Exploring characteristics of and transitions between mental states within the Multi-Action Plan model in high-level judo\", European Journal of Sport Science 24, 907-917 (2024), DOI 10.1002/ejsc.12117; read in the publisher's PDF held by a co-author's university repository",
      publisher: "University G. d'Annunzio of Chieti-Pescara research repository",
      url: "https://ricerca.unich.it/retrieve/5cb23145-61fb-487a-8966-945ff52f719a/European%20Journal%20of%20Sport%20Science%20-%202024%20-%20Kellermann%20-%20Exploring%20characteristics%20of%20and%20transitions%20between%20mental%20states.pdf",
      accessed: "2026-11-11",
    },
  ],
  relatedSlugs: [
    "drilling-rehearsing-and-positional-sparring",
    "leave-your-ego-at-the-door",
  ],
  contestedNotes: [
    "No federation or rule-book definition of the flow roll was found. The IBJJF Rule Book was the only federation document searched, and it governs competition. Five pages by instructors, academies and one retailer's blog are quoted as examples of how the term is defined in print; they are evidence about those five pages only, and the piece makes no claim about how common any definition is.",
    "The account of flow theory is taken from the 2022 scoping review by Peifer and colleagues and the 2020 conceptual analysis by Abuhamdeh. Csikszentmihalyi's own books were not read, and the nine characteristics, the challenge-skill models and the split into preconditions and components are reported as those later authors give them.",
    "Abuhamdeh's paper argues for a position: that flow should be treated as a discrete, rare, enjoyable state kept separate from its conditions. Other researchers conceptualise it differently, as the scoping review records. His statement that flow is not always optimised by a balance of challenge and skill rests on a 2008 study that was not read for this piece, and it is reported at second hand.",
    "The figure of 81 per cent of 16 figure skaters is from a 1992 study reported in the Swann review and was not read in the original. The review itself was read in its accepted manuscript, not the published version, and covers elite athletes only.",
    "The jiu-jitsu study is one online survey of 136 practitioners using a nine-item short questionnaire about general, recalled experience. It did not examine flow rolling, and its rolling category is full sparring. The direction of the differences it found is not stated in the article because the paper's text does not give it and its table did not extract reliably.",
    "The judo study interviewed six high-level British judoka in retrospect, using the Multi-Action Plan model and not a flow questionnaire. Treating its Type 1 as flow-like follows the paper's own wording. Its authors do not present the findings as generalisable.",
    "The placing of the flow roll between rehearsal and sparring, the remark that flow has a third use for a manner of moving, and the whole final section are this site's argument. No study read for this piece examined a flow roll, so the statement that the round and the state do not guarantee each other is a reading of two definitions and not a finding.",
  ],
};
