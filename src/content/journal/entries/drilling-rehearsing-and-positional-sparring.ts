import type { PublishedArticle } from "../types.ts";

/**
 * A training-culture piece that had to be built almost entirely from adjacent
 * literature, because no published study examines positional sparring in
 * grappling. The article says so in its second section rather than borrowing
 * the authority of research that was done on other people doing other things.
 *
 * The motor-learning evidence it does cite is the subject of a live and public
 * academic dispute. Both sides are named in the body text. No medical, injury
 * or recovery claim appears anywhere in the piece.
 */
export const drillingRehearsingAndPositionalSparring: PublishedArticle = {
  status: "published",
  publishedAt: "2026-08-04",
  authorId: "rick-r",
  slug: "drilling-rehearsing-and-positional-sparring",
  category: "training-culture",
  title: "Drilling, rehearsing, and what positional sparring changes",
  standfirst:
    "Three different activities share one word in most gyms, and the confusion is not linguistic: it shows up in how the hour is spent and in what the room believes it is buying.",
  metaDescription:
    "Three different activities share one word in most gyms, and the confusion is not linguistic - it shows up in how the hour is spent.",
  sections: [
    {
      id: "three-activities-one-word",
      heading: "Three activities, one word",
      paragraphs: [
        "Watch an hour of any grappling class and you will see at least three distinct things called drilling, with nothing in common except that a coach announced them.",
        "The first is repetition against a compliant partner who knows what is coming and does not resist. The movement is executed correctly by construction, because the conditions have been arranged so that failure is impossible. Call this rehearsing, in the theatrical sense: running the lines with the other actor, in order, to get the sequence into the body.",
        "The second is repetition against a partner giving a defined and honest resistance, where the movement can fail and sometimes does. The problem is real, but it is one problem, presented repeatedly.",
        "The third is positional sparring: a start position, a defined objective for each person, a clock, and a reset. Both people are trying. Neither knows what will happen. The only thing being controlled is where the round begins and what counts as it being over.",
        "These are not points on a single dial from easy to hard. They differ in what varies, in what the participant has to decide, and in what a repetition costs. Treating them as interchangeable, which the shared vocabulary encourages, means a gym can believe it has trained something it has only recited.",
      ],
    },
    {
      id: "nobody-has-studied-this",
      heading: "Nobody has studied this",
      paragraphs: [
        "Before borrowing any evidence, the honest statement: there is no published study of positional sparring in grappling. No trial has compared it against full rounds or against rehearsal, in jiu-jitsu or in any related sport, with any outcome measure.",
        "That absence is worth sitting with, because the vacuum is normally filled by confident writing that sounds sourced. Every argument you will read about how grappling should be practised, including this one, is built out of research done on other people performing other tasks, and the borrowing is almost never declared.",
        "So the rest of this article names its borrowings. Two are from motor learning, one is from a combat sport that is not grappling, one is from a body of theory about practice design. Each is a real, checkable piece of work. None of them was done on anybody rolling.",
        "There is one grappling-specific number worth having in hand first, because it changes the arithmetic of a session. In the no-gi submission-only competition analysed by Spanias, Kirk and Ovretveit, the mean match lasted 278 seconds. A single five-minute round in a gym is longer than the average competitive match in that sample. Whatever a room decides to do with its rounds, it is not short of them relative to the events they point at.",
      ],
    },
    {
      id: "the-varied-practice-evidence-is-contested",
      heading: "The varied-practice evidence is contested, in public",
      paragraphs: [
        "The idea usually reached for at this point is contextual interference: the finding that practising several skills in an interleaved, unpredictable order produces worse performance during practice and better retention afterwards than practising them in blocks. It is the closest thing motor learning has to a justification for making training messy on purpose.",
        "In 2024 Czyz, Wojcik, Solarska and Kiper published a systematic review and meta-analysis in Scientific Reports. They found 1,255 records, screened 294 full texts and included 54 studies. Their pooled estimate for high contextual interference on retention was a standardised mean difference of 0.63, which is a medium effect.",
        "The subgroup analysis is the part that a gym should care about. Split by setting, the 30 laboratory studies produced a large effect at 0.92, and the 24 studies conducted in applied settings produced 0.23, which did not reach statistical significance. The authors also record that only three of the included articles were rated as being of moderate or high methodological quality.",
        "That paper is itself disputed, publicly and by name. Ammar and Schollhorn published a formal comment challenging both its treatment of earlier reviews and its conclusion that the effect is robust, and in 2025 Ammar, Trabelsi, Salem, Jahrami and Schollhorn published a longer response in Educational Psychology Review that widens the argument to what they describe as statistical ritualism, inconsistent quality control and a growing redundancy of evidence syntheses in the field.",
        "The correct summary is therefore not that science supports varied practice. It is that a large literature reports a real effect under laboratory conditions, that the same literature's effect shrinks to something indistinguishable from nothing when the task is a real sport skill in a real setting, and that specialists are currently arguing in print about how much of it survives. Any coach told the research is settled has been told wrong, in either direction.",
      ],
    },
    {
      id: "training-is-not-competition-even-when-it-looks-like-it",
      heading: "Training is not competition, even when it looks identical",
      paragraphs: [
        "The most useful study for this subject was done in taekwondo, and it is useful precisely because its design removes the excuse that training and competition differ only in stakes.",
        "Maloney, Renshaw, Headrick, Martin and Farrow put ten elite Australian athletes through two conditions: training sparring against familiar national teammates, and a simulated competition against unfamiliar international opponents with crowd, officials and prizes. The fighting looked like the same activity. The measurements said otherwise.",
        "In the training condition athletes attacked less often, with an effect size of 0.81. Their movement trajectories were more predictable, measured by sample entropy, at 0.11 in training against 0.15 in competition. They reported lower cognitive anxiety, lower arousal and lower perceived mental effort, at 1.26, 1.07 and 0.77 respectively. They stood further apart: the peak interpersonal distance was 187 centimetres in training and 177 in competition. Their pre-fight heart rate averaged 116 beats per minute in training and 129 in competition.",
        "Read the behavioural findings together and the picture is specific rather than moralising. Familiarity with the opponent removed problems that would otherwise have had to be solved, and the athletes moved in more repeatable ways as a result. The authors' conclusion is that these lower-fidelity actions are likely to work against transfer to competition.",
        "The caveats are real and should travel with the finding. Ten athletes, one sport, one country, and a simulated competition rather than a tournament. Nothing here has been replicated in grappling. What it establishes is narrower and still worth having: sparring that resembles competition on video can differ measurably from it in what the participants are actually doing, and the difference is visible in movement, not only in self-report.",
      ],
    },
    {
      id: "representativeness-is-a-design-decision",
      heading: "Representativeness is a design decision",
      paragraphs: [
        "The framework that makes sense of that result is representative learning design, which holds that a practice task should carry the informational features that regulate behaviour in the competitive setting, rather than merely resembling it.",
        "Woods, McKeown, Rothwell, Araujo, Robertson and Davids set out the position in a 2020 review, describing the practitioner's job as designing an environment rather than prescribing a movement template. The distinction they draw is between functional fidelity to the information an athlete uses and literal structural equivalence to the competition format. Deliberately manipulating constraints, including ones that have nothing to do with physical resemblance, is treated in that account as design rather than as distortion.",
        "This is where positional sparring stops being a filler exercise and becomes a claim. Choosing a start position is choosing which problem exists for the next four minutes. Choosing objectives for both people decides what will count as having solved it. Choosing the reset decides how many times the problem occurs. A room that starts every positional round from the same place has not just made a scheduling decision; it has decided which information its members spend their hours becoming attuned to.",
        "The framework does not settle which start positions are correct, and it is not evidence that positional rounds beat any alternative. What it supplies is a vocabulary for asking whether the constraints you have imposed are the ones the competitive situation would impose, and for noticing when a task has kept the shape of competition while removing the thing that made it a problem.",
      ],
    },
    {
      id: "what-a-round-structure-encodes",
      heading: "What a round structure encodes",
      paragraphs: [
        "All of which turns a scheduling question into a cultural one, and this is the part that has no research behind it at all.",
        "An hour is a budget. Every minute given to rehearsal is a minute not given to a decision under uncertainty, and every minute of open rolling is a minute in which the problems that arise are whichever ones the pairing happened to generate. Neither is wrong. But the split is a statement of belief about what improves people, made in public, every session, by a room that mostly has not noticed it is making one.",
        "The details carry more than they seem to. Who chooses the start position tells you whether the room thinks the coach or the athlete should be identifying the problem. Whether beginners are given positional rounds at all tells you whether the room believes decision-making is something you earn access to or something you build from the start. Whether rounds reset on a submission or run to the clock tells you whether the room is training an outcome or a duration. Whether people are allowed to lose a position quietly and keep working, or whether the round is treated as a verdict, sets what it costs to attempt something unfamiliar in front of everybody.",
        "None of that is measurable and none of it is being asserted as effective here. It is simply true that these choices are being made, that they are legible to anyone watching, and that most rooms have inherited them rather than decided them.",
      ],
    },
    {
      id: "the-honest-size-of-the-claim",
      heading: "The honest size of the claim",
      paragraphs: [
        "It would be easy to finish by declaring that positional sparring is what actually develops people. That claim is not available, and it is worth being precise about why.",
        "There is no grappling study. The motor-learning result that would support it is large in the laboratory, statistically indistinguishable from nothing in applied settings, and currently the subject of a published dispute between named researchers. The combat-sport evidence describes a gap between training and competition in ten taekwondo athletes and does not show that any particular training format closes it. And in the wider literature on practice generally, Macnamara, Hambrick and Oswald's meta-analysis found that deliberate practice accounted for 18 per cent of the variance in performance across sports, which leaves a great deal of the outcome to things that a session plan does not control.",
        "What survives all that is a distinction and a question. The distinction is that rehearsing a sequence, solving a defined problem repeatedly, and making decisions under genuine uncertainty are three activities, and that a room which calls them all drilling cannot audit its own week. The question is what the start position, the objective and the reset in your positional rounds are selecting for, and whether anybody chose them.",
        "Two closing cautions, both specific. Nothing in this article is a medical, injury or recovery claim, and none of the research cited here examined any of those things. And the practical decisions it describes, meaning how hard a round is contested, who is put with whom, and when a start position is unsuitable for the people in it, are exactly the decisions that require a qualified coach who can see the room. Reading is not a substitute for that, and this piece is not offered as one.",
      ],
    },
  ],
  sources: [
    {
      title:
        "Stanislaw H. Czyz, Aleksandra M. Wojcik, Petra Solarska and Pawel Kiper, \"High contextual interference improves retention in motor learning: systematic review and meta-analysis\", Scientific Reports 14, 15974 (2024), DOI 10.1038/s41598-024-65753-3",
      publisher: "PubMed Central",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC11237090/",
      accessed: "2026-08-03",
    },
    {
      title:
        "Achraf Ammar and Wolfgang I. Schollhorn, \"Comment on Czyz et al. (2024) on Contextual Interference in Motor Learning\" (preprint)",
      publisher: "SportRxiv",
      url: "https://sportrxiv.org/index.php/server/preprint/view/435",
      accessed: "2026-08-03",
    },
    {
      title:
        "Achraf Ammar, Khaled Trabelsi, Atef Salem, Haitham A. Jahrami and Wolfgang I. Schollhorn, \"Advancing Contextual Interference: Addressing Methodological Debates, Reflecting on Meta-Analytic Practices and Generalizability, and Guiding Future Directions in Motor Learning\", Educational Psychology Review (2025), DOI 10.1007/s10648-025-10043-1",
      publisher: "Springer",
      url: "https://doi.org/10.1007/s10648-025-10043-1",
      accessed: "2026-08-03",
    },
    {
      title:
        "Michael A. Maloney, Ian Renshaw, Jonathon Headrick, David T. Martin and Damian Farrow, \"Taekwondo Fighting in Training Does Not Simulate the Affective and Cognitive Demands of Competition: Implications for Behavior and Transfer\", Frontiers in Psychology 9, 25 (2018), DOI 10.3389/fpsyg.2018.00025",
      publisher: "Frontiers in Psychology",
      url: "https://www.frontiersin.org/journals/psychology/articles/10.3389/fpsyg.2018.00025/full",
      accessed: "2026-08-03",
    },
    {
      title:
        "Carl T. Woods, Ian McKeown, Martyn Rothwell, Duarte Araujo, Sam Robertson and Keith Davids, \"Sport Practitioners as Sport Ecology Designers: How Ecological Dynamics Has Progressively Changed Perceptions of Skill Acquisition in the Sporting Habitat\", Frontiers in Psychology 11, 654 (2020)",
      publisher: "PubMed Central",
      url: "https://pmc.ncbi.nlm.nih.gov/articles/PMC7194200/",
      accessed: "2026-08-03",
    },
    {
      title:
        "Brooke N. Macnamara, David Z. Hambrick and Frederick L. Oswald, \"Deliberate practice and performance in music, games, sports, education, and professions: a meta-analysis\", Psychological Science 25(8), 1608-1618 (2014), DOI 10.1177/0956797614535810",
      publisher: "PubMed, National Library of Medicine",
      url: "https://pubmed.ncbi.nlm.nih.gov/24986855/",
      accessed: "2026-08-03",
    },
    {
      title:
        "Charalampos Spanias, Christopher Kirk and Karsten Ovretveit, \"Position before submission? Techniques and tactics in competitive no-gi Brazilian jiu-jitsu\", Revista de Artes Marciales Asiaticas 17(2), 130-139 (2022)",
      publisher: "Sheffield Hallam University Research Archive (SHURA)",
      url: "https://shura.shu.ac.uk/31193/",
      accessed: "2026-08-03",
    },
  ],
  relatedSlugs: [
    "guard-retention-as-a-system",
    "how-no-gi-rulesets-reshaped-technique-selection",
  ],
  contestedNotes: [
    "No published study examines positional sparring in grappling, in any form, with any outcome measure. Every argument in this article about how grappling should be practised is built from research conducted on other populations performing other tasks, and the article makes no claim that the transfer holds.",
    "The contextual interference literature is the subject of an active, named academic dispute. Czyz and colleagues (2024) report a medium pooled effect on retention; Ammar and Schollhorn have published a formal comment challenging that paper's methodology and its conclusion that the effect is robust, and a longer 2025 response in Educational Psychology Review widens the criticism to meta-analytic practice in the field. This article reports the disagreement rather than picking a side.",
    "Within the Czyz meta-analysis itself, the effect on retention was large in laboratory studies and small and not statistically significant in applied settings. The authors also state that only three of the 54 included articles were rated as being of moderate or high methodological quality. Both facts limit how far the finding supports any claim about a gym.",
    "The Maloney findings come from ten elite taekwondo athletes in one country, comparing training sparring with a simulated competition rather than a tournament. They have not been replicated in grappling and cannot be assumed to hold for it.",
    "The section on what a room's round structure encodes is interpretation, not evidence. No research is cited for it because none exists, and it is offered as an observation about choices that are being made rather than as a claim about their effects.",
    "Macnamara and colleagues' figure of 18 per cent of variance explained by deliberate practice in sports is a meta-analytic estimate across many domains and study designs, and the definition and measurement of deliberate practice in that literature is itself disputed. It is cited here to bound the claim, not to make one.",
  ],
};
