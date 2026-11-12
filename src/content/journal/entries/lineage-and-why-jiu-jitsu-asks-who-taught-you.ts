import type { DraftArticle } from "../types.ts";

/**
 * A piece about lineage as an idea. It recites nobody's lineage, names no
 * living person's rank and takes no view on anyone's legitimacy.
 *
 * Sourced: the IBJJF General System of Graduation (the June 2026 PDF linked
 * from ibjjf.com/graduation-system), cited by the article numbers printed in
 * the body of the document. Its index numbers the articles one higher than
 * the body does (the index has "Article 7, Professors and Instructors"; the
 * body prints the same rules as Article 6); the body numbering is used here
 * because the document's own cross-references follow it. The IBJJF
 * certification checklist is rendered by script, and was read from the
 * script bundle the certification page loads. The UKBJJA
 * sentences are from its club-membership and about pages. The Kodokan
 * material is from its English pages, its 2024 dan examination outline (PDF)
 * and its dan application form. The historical claims are limited to what
 * Cairus, Drysdale and Pedreira say in the sources the Maeda article already
 * cites, re-read for this piece, and are reported as theirs.
 *
 * Ours, and labelled as ours in the copy: the description of the custom in
 * the first section; the argument that a lineage is how an art without an
 * examining body vouches for rank; and the point that a chain of names
 * records promotions, not teaching.
 *
 * Draft: no one has read and signed off this piece, so it carries no byline
 * and no date.
 */
export const lineageAndWhyJiuJitsuAsksWhoTaughtYou: DraftArticle = {
  status: "draft",
  slug: "lineage-and-why-jiu-jitsu-asks-who-taught-you",
  category: "bjj-history",
  title: "Lineage, and why jiu-jitsu asks who taught you",
  metaTitle: "Lineage: why jiu-jitsu asks who taught you",
  standfirst:
    "A jiu-jitsu black belt usually arrives with a chain of names behind it. The published rules ask for signatures and proof of promotion, which is what the chain supplies, and there are things a chain of names cannot tell you however accurate it is.",
  metaDescription:
    "Why jiu-jitsu asks who promoted you: what the IBJJF and UKBJJA ask for as proof of rank, how the Kodokan differs, and what a lineage cannot show.",
  sections: [
    {
      id: "the-question-a-visitor-gets-asked",
      heading: "The question a visitor gets asked",
      paragraphs: [
        "Walk into a jiu-jitsu academy as a visitor wearing a coloured belt and somebody will ask who you got it from. The answer expected is a name, and usually a second name behind it: the person who promoted you, and the person who promoted them. Black belts are often introduced with a whole chain of these, running back to one of a small number of early teachers. That description is our own observation of the custom, not a finding from any survey.",
        "This piece is about that habit as an idea. It recites nobody's lineage and takes no view on anybody's rank. The questions are narrower: what the published rules ask for when rank has to be proved, what work the chain of names is doing, and what a chain of names is unable to tell you even when every link in it is true.",
      ],
    },
    {
      id: "what-the-federation-document-asks-for",
      heading: "What the federation's document asks for",
      paragraphs: [
        "The International Brazilian Jiu-Jitsu Federation publishes a General System of Graduation; the version read here is dated June 2026. It sets a minimum age for each belt and a minimum period at each one, and it describes the belts themselves down to the width in centimetres. On how quickly a student moves, it defers to the teacher. Article 3.2.2 reads: \"The time taken to graduate the athlete from White Belt to Black Belt is at the professor's discretion.\" The same article adds that the federation will only recognise the graduation if the mandatory minimum times have been met.",
        "Who may promote whom is answered with signatures. Under Article 6.1, the membership request of an athlete at any belt from white to brown \"must be signed/approved by an IBJJF affiliated Black Belt Professor\". Under Article 6.2, a promotion to black belt \"can only be signed by a Black Belt Professor who has at least 2 (two) Degrees certified by IBJJF\". Article 4.1.5 lets a black belt request the first degree after three years of proven activity under the federation and the second after six, so the person signing a new black belt has, on the document's own arithmetic, been a registered black belt for at least six years.",
        "The document also has a rule for people who arrive holding a rank the federation has no record of. Article 7.1 gives a \"provisional graduation\" to brown and black belts who register without a previous registration at the belt below. The status lasts two years, during which, Article 7.2 says, the federation \"reserves the right to revoke an athlete's graduation at its discretion\". A provisional black belt needs the signature of a professor with at least three degrees (Article 7.4), is expected to stay with the same professor or the same academy for the two years (Article 7.5), cannot be the head professor of an academy (Article 7.6), and cannot request a black belt certificate until the period is over (Article 7.7).",
        "The certificate is a separate application. Article 5.1 lists four requirements: affiliation at the time of the request, no provisional status, a first aid or CPR course certificate, and a certificate from the federation's referee programme, rules seminar or rules webinar dated within the previous twelve months. The certification page on the federation's site gives the same list, with a background check and SafeSport training added for applicants in the United States. What the list does not include is any test of technique.",
      ],
    },
    {
      id: "a-national-body-that-uses-the-word",
      heading: "A national body that uses the word",
      paragraphs: [
        "The word lineage does not appear anywhere in the IBJJF document. It does appear in the rules of the UK Brazilian Jiu-Jitsu Association, which describes itself as the official national governing body for the sport in the UK. Its guidelines for member clubs say: \"All BJJ instructors must be purple belt or higher from a verifiable lineage. We will ask for proof of promotions, including timescales.\" Its instructor membership is open to purple belts and above at a member club, with the note that \"Proof of grade will be required\". Among the objectives the association lists for itself is \"To preserve the integrity of the ranking system\".",
        "Read together, the two bodies ask for the same kind of thing in different vocabularies. One asks for the signature of a registered professor of a stated degree. The other asks for proof of who promoted you and when. Neither asks the applicant to show what they know. Both are checking a record of promotions, and the association's phrase for a satisfactory record is a verifiable lineage.",
      ],
    },
    {
      id: "what-the-chain-of-names-is-doing",
      heading: "What the chain of names is doing",
      paragraphs: [
        "Here is our reading of why the custom exists. None of these documents makes it. In jiu-jitsu, rank is awarded by a teacher, in a room, on that teacher's judgement. The IBJJF document contains no syllabus and no examination for any belt; what it regulates is age, time and the standing of the person who signs. A federation built that way can tell you that a promotion was signed by somebody entitled to sign it. It cannot tell you why the teacher thought the student was ready, because that was never written down.",
        "So the question of whether a belt means anything gets passed back one step. This belt is sound if the person who awarded it knew what a black belt is; that person's judgement is sound if their own teacher's was; and so on back. A lineage is that regress written out as a list. It works the way endorsements work on a cheque that has changed hands several times: each signature vouches for the one before it, and the reader is trusting the whole run.",
        "That would also explain why the question gets asked at the door and not only on federation paperwork. A visitor's belt is a claim about how they will behave in sparring and what they can safely be shown. With no examining body to consult, the fastest check available is a name the room already knows. On this reading the custom has less to do with ancestry than with credit: who is prepared to stand behind this person.",
      ],
    },
    {
      id: "the-kodokan-for-contrast",
      heading: "The Kodokan, for contrast",
      paragraphs: [
        "Judo's founding institution does it differently, and says so on its own English pages. The Kodokan lists \"Certifying Kodokan Dan grading of Judo\" among its activities, and its page on the system opens: \"Kodokan certifies Dan grades.\" Grades are taken in order, from first dan to second and then to third. The page also describes a route it calls Batsugun, by which a competitor who gets the required streak of wins at its Red and White contests moves up to the next grade on the day.",
        "The outline the Kodokan published for the 2024 dan promotion examination of its International Division shows what central grading involves. Candidates had to meet the institute's internal rules for promotion, to have attended its summer kata course, and to submit an approval letter from a judo federation with the application form. The examination contents were listed as basic knowledge, basic movements, nage-waza, katame-waza, kata and randori, with named kata set against each grade from first dan to eighth. A pass then went to a council for review before a certificate was issued. The outline also warns candidates that the dan ranks of their own country are not the same as those of the Kodokan.",
        "The difference is where the authority sits. At the Kodokan a grade is the institution's own statement, made after its own examination, and the name of the candidate's teacher is not what makes it valid. The application form asks for that name anyway: it has a field for the candidate's present club and sensei, and another for the club and sensei they started judo with. Even a central body wants to know who taught you. It does not have to rest the grade on the answer.",
      ],
    },
    {
      id: "what-a-chain-of-names-cannot-tell-you",
      heading: "What a chain of names cannot tell you",
      paragraphs: [
        "A lineage records who promoted whom. It does not record what was taught, for how long, or how much of it the student kept. That is a point of logic and not of history, and it is ours. Two people with identical chains can have learned quite different jiu-jitsu, and a person can have learned most of what they know from somebody who appears in no chain at all, because that person never awarded them a belt.",
        "Roberto Pedreira, the author of the Choque histories of jiu-jitsu in Brazil, draws the distinction sharply in a published list of myths about Mitsuyo Maeda: \"Taking lessons from someone and being certified by them are entirely different things.\" He also shows where the looser sense of the word leads. Follow teachers of teachers far enough, he writes, and everyone who trains jiu-jitsu, or ever did, has a lineage that goes back to Kano, the founder of judo, and further still, since Kano had teachers of his own. A chain that everybody shares distinguishes nobody.",
      ],
    },
    {
      id: "where-the-best-known-chains-begin",
      heading: "Where the best-known chains begin",
      paragraphs: [
        "The chains most often recited run back to Maeda's club in Belem in the 1910s, and that is where the record is thinnest. Our article on Maeda sets out the disagreements in detail; two of them bear directly on rank. Jose Cairus, in a journal article on the period, reports that in 1928 Maeda confided to Hajime Otake that he had never awarded a black belt to any student in Brazil. Robert Drysdale, in an interview about his archival work, describes five Brazilians promoted by Maeda to a rank a journalist recorded as primeiro galao, and says what the journalist meant by it is unclear: something close to a modern black belt, a first-degree black belt on the judo pattern, or a grading hierarchy of Maeda's own.",
        "A second chain has the same difficulty one link down. Drysdale has said of the line that runs through Luiz Franca that nobody can trace where Franca learned, and that researchers in Brazil have looked. The editor of the reference site BJJ Heroes, asked to comment in the same report, answered that there are books naming Franca's teachers and that training in the early 1900s was not documented the way it is now. Both men are describing a gap in the paperwork, and this piece does not settle it.",
        "None of this is a comment on anybody's rank, and it does not make a modern chain false. A promotion signed last year by a registered professor is about as well documented as anything in the sport. The point is about direction. The further back a lineage runs, the more of its links were made before anyone kept the kind of record the federations now ask for, and the first links are the ones the historians are still arguing over.",
        "Asked at the door, the question deserves a plain answer and a modest reading. The answer tells the room who vouched for you. It says nothing certain about what you were taught, and at its far end it rests on a few years in Belem that the sources do not agree about.",
      ],
    },
  ],
  sources: [
    {
      title:
        "General System of Graduation, June 2026 (PDF): Articles 3.2.2, 4.1.5, 5.1, 6.1, 6.2 and 7.1 to 7.7, numbered as printed in the body of the document",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/rails/active_storage/blobs/redirect/eyJfcmFpbHMiOnsibWVzc2FnZSI6IkJBaHBBdEJqIiwiZXhwIjpudWxsLCJwdXIiOiJibG9iX2lkIn19--1d5712ea2c9ff11e65a61ed25b1f24867733bae9/20260611_IBJJF_Graduacao_EN.pdf",
      accessed: "2026-11-11",
    },
    {
      title: "Graduation system (the page that links the PDF above)",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/graduation-system",
      accessed: "2026-11-11",
    },
    {
      title:
        "Black Belt Certification: document checklist (rendered by script; read from the script the page loads)",
      publisher: "International Brazilian Jiu-Jitsu Federation",
      url: "https://ibjjf.com/athletes/black-belt-certification",
      accessed: "2026-11-11",
    },
    {
      title:
        "Club Membership: guidelines for member clubs (\"verifiable lineage\", \"proof of promotions, including timescales\") and instructor membership (\"Proof of grade will be required\")",
      publisher: "UK Brazilian Jiu-Jitsu Association",
      url: "https://www.ukbjja.org/membership/club-membership/",
      accessed: "2026-11-11",
    },
    {
      title: "About: status as national governing body, and the association's listed objectives",
      publisher: "UK Brazilian Jiu-Jitsu Association",
      url: "https://www.ukbjja.org/about/",
      accessed: "2026-11-11",
    },
    {
      title: "Dan Grading System",
      publisher: "Kodokan Judo Institute",
      url: "https://kdkjudo.org/en/dan-grading/",
      accessed: "2026-11-11",
    },
    {
      title: "Activities (item 12, \"Certifying Kodokan Dan grading of Judo\")",
      publisher: "Kodokan Judo Institute",
      url: "https://kdkjudo.org/en/about-kodokan/",
      accessed: "2026-11-11",
    },
    {
      title:
        "Kodokan Dan Promotion Examination for Kodokan International Division, 20 July 2024: outline (PDF)",
      publisher: "Kodokan Judo Institute",
      url: "https://kdkjudo.org/wp-content/uploads/2024/06/Outline-of-Kodokan-Dan-Exam-2024.docx.pdf",
      accessed: "2026-11-11",
    },
    {
      title:
        "Kodokan Dan Promotion Examination (the page that links the outline and the Application for Promotion in Kodokan Dan Grade form)",
      publisher: "Kodokan Judo Institute",
      url: "https://kdkjudo.org/en/2024/06/11/kodokan-dan-promotion-examination/",
      accessed: "2026-11-11",
    },
    {
      title:
        "Top 20 Myths about Mitsuyo Maeda (Roberto Pedreira's text, as republished): Myth 2, lessons versus certification",
      publisher: "sonnybrown.net",
      url: "https://www.sonnybrown.net/top-20-myths-about-mitsuyo-maeda/",
      accessed: "2026-11-11",
    },
    {
      title:
        "Jose Cairus, \"Modernization, nationalism and the elite: the Genesis of Brazilian jiu-jitsu, 1905-1920\", Revista Tempo e Argumento, vol. 3, no. 2, 2011 (note 88)",
      publisher: "Universidade do Estado de Santa Catarina, via Redalyc",
      url: "https://www.redalyc.org/journal/3381/338130377006/html/",
      accessed: "2026-11-11",
    },
    {
      title: "Interview: Robert Drysdale on the first five Brazilians promoted by Mitsuyo Maeda",
      publisher: "BJJ Heroes",
      url: "https://www.bjjheroes.com/interview/robert-drysdale-on-the-first-5-brazilians-promoted-by-mitsuyo-maeda",
      accessed: "2026-11-11",
    },
    {
      title:
        "Drysdale on Fadda/Franca Lineage: 'No Evidence That They Learned From Maeda', with a response from the editor of BJJ Heroes",
      publisher: "BJJ Eastern Europe",
      url: "https://www.bjjee.com/articles/drysdale-faddafranca-lineage-no-evidence-learned-maeda/",
      accessed: "2026-11-11",
    },
  ],
  relatedSlugs: [
    "maeda-and-the-arrival-of-judo-in-brazil",
    "maximum-efficiency-and-mutual-welfare",
    "jiu-jitsu-jujutsu-and-the-spelling-of-the-name",
  ],
  contestedNotes: [
    "The description of the custom (visitors asked who promoted them, black belts introduced with a chain of names) is this site's observation. No survey or study of it was found, and none is cited.",
    "The argument that a lineage is how an art without a central examining body vouches for rank is this site's own. The IBJJF and UKBJJA documents state what they require; neither explains the custom, and neither says it has no examination. That the IBJJF General System of Graduation contains no syllabus or examination is our reading of the June 2026 text.",
    "What rank Mitsuyo Maeda awarded in Brazil is unresolved. Cairus reports that in 1928 Maeda told Hajime Otake he had never awarded a black belt to any student in Brazil; Drysdale describes five Brazilians promoted by Maeda to a rank the press recorded as primeiro galao and says its meaning is unclear. The two accounts are not necessarily incompatible, and neither is treated as settled here.",
    "Where Luiz Franca learned is disputed. Drysdale says it cannot be traced and that no evidence of a link to Maeda has been found; the editor of BJJ Heroes replied that books name Franca's teachers and that the absence of records is expected for the period. This piece reports both and decides neither.",
    "The IBJJF document's index and body number its articles differently: the index opens with an Article 1, Introduction, that the body does not number, so it lists professors and instructors as Article 7 where the body prints Article 6. Clauses are cited here by the body numbering, which the document's own cross-references use.",
  ],
};
