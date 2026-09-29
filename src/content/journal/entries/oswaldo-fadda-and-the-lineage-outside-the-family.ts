import type { DraftArticle } from "../types.ts";

/**
 * B3. Built around the one contemporary document we could read: page 2 of the
 * Rio newspaper Diario da Noite for Friday 14 January 1955, which carries
 * Fadda's challenge to the Gracie academy. It was read from a scan on a public
 * image host (the page header and masthead are legible in it); the Hemeroteca
 * Digital Brasileira refused automated requests with a 403, so it was not
 * checked against a library copy. Translations from the Portuguese are ours.
 *
 * That page moves the challenge from the 1951 that BJJ Heroes gives, and that
 * this site's own Figures entry repeats, to January 1955. The piece reports the
 * disagreement and the document; it does not state any match result, because
 * the only result reports we found are later retellings that cite no contemporary report of the bouts.
 *
 * Drysdale's position is reported as what he said: that no evidence links
 * Luiz Franca to Maeda. The brief described it as questioning the "non-Gracie"
 * label; his published words question the Maeda link, and the piece follows
 * the words. No one is said to have invented the foot lock, and the line is
 * not compared with any other.
 *
 * Draft: no author has read this piece, so it carries no byline and no date.
 */
export const oswaldoFaddaAndTheLineageOutsideTheFamily: DraftArticle = {
  status: "draft",
  slug: "oswaldo-fadda-and-the-lineage-outside-the-family",
  category: "influential-practitioners",
  title: "Oswaldo Fadda, and the lineage that grew outside the family",
  metaTitle: "Oswaldo Fadda, the lineage outside the family",
  standfirst:
    "The best-known teaching line in Brazilian jiu-jitsu that does not run through the Gracie academy is usually told in three facts: a suburb, a challenge and a foot lock. One newspaper page from January 1955 confirms the first two and moves the date; the third has no contemporary source we could find.",
  metaDescription:
    "Oswaldo Fadda's jiu-jitsu line, read from a 1955 Rio newspaper page and the sources that retell it: what is documented, what is dated wrongly, and what is not.",
  sections: [
    {
      id: "a-newspaper-page",
      heading: "A newspaper page, January 1955",
      paragraphs: [
        "Page 2 of the Rio de Janeiro paper Diario da Noite for Friday 14 January 1955 carries a two-column item under the headline \"A Academia Fada de Jiu-Jitsu desafia os Gracie\": the Fadda academy of jiu-jitsu challenges the Gracies. The paper spells the name with one d throughout. It reports that the professor Oswaldo Fada, director of the academy, of Bento Ribeiro, had come to the newsroom the day before to issue, through the paper, a challenge to what it calls the kings of jiu-jitsu.",
        "The quoted statement that follows is more careful than the retellings. Fadda says he wants his students to meet those of the Gracie academy, and that he is making the challenge public knowing it is a famous, traditional and powerful academy. \"We respect them as incomparable adversaries, but we do not fear them.\" He says he has no pretension of beating them, since famous fighters known around the world never had, and that he directs a modest academy whose students have no complexes; if they do not succeed, that will be one of the contingencies of sport. He has about twenty students for the bouts, and he leaves the time to the Gracie academy and the venue to the Gracies' discretion.",
        "That page is the only contemporary document about Fadda we were able to read for this piece. Everything else below is a later account, and the useful exercise is to hold each of them up against it.",
      ],
    },
    {
      id: "bento-ribeiro",
      heading: "Bento Ribeiro, and teaching where the sport was not",
      paragraphs: [
        "The outline of Fadda's life is agreed between the two reference sources that give one. BJJ Heroes and GracieMag both say he began training in 1937 under Luiz Franca while serving in the Brazilian marines, and received his black belt, or instructor grade, from Franca in 1942. Both describe him teaching by demonstration in public squares, church courtyards and outdoor venues, and both date his own academy to January 1950; BJJ Heroes gives the day as 27 January. BJJ Heroes gives his birth as 15 January 1921 in Bento Ribeiro, and GracieMag gives the years of his life as 1921 to 2005.",
        "The newspaper page fits that outline. It places the academy in Bento Ribeiro, a suburb of the city, and it has Fadda describe his own school as modest. What it adds is tone. The man in the 1955 item is not the outcast of later retellings throwing down a gauntlet. He is a suburban teacher using a newspaper to get a match with an academy the paper calls the kings of jiu-jitsu, and saying in print that he does not presume to beat it.",
        "Robert Drysdale, who filmed at the academy for a documentary on the period, described Fadda, in remarks BJJ Eastern Europe reported in 2020, as one of the first to teach in the Rio suburbs, and as someone who taught disabled students and poor children and made gis himself to give them. None of that is a technical contribution. All of it is a claim about who was allowed into the room, and it is the claim the sources agree on most.",
      ],
    },
    {
      id: "luiz-franca",
      heading: "Luiz Franca, and a link asserted more than shown",
      paragraphs: [
        "BJJ Heroes' Fadda page gives his lineage as Mitsuyo Maeda, then Luis Franca, then Fadda. Its page on Franca tells a longer story: that Franca trained for about a year at the Manaus academy of Soishiro Satake, another Kodokan judoka who had travelled with Maeda; that he then moved to Belem, where Maeda was based, and trained under him; that he later trained in Sao Paulo with Geo Omori; and that he settled on the outskirts of Rio, teaching army men including a young marine named Oswaldo Fadda. The page cites a Brazilian book series, O Livro Proibido do Jiu Jitsu, and a blog. Its own Fadda page qualifies Franca's instructor grade with the word allegedly.",
        "Drysdale's position, as BJJ Eastern Europe reported it, is that there is no evidence for any of it. If you look on the internet, he said, you will find Maeda and you will find Geo Mori, as he put it, as Franca's teachers, but researchers in Brazil have looked for that evidence for a long time without finding it, and his suspicion is that Franca was largely self-taught. He did not say the Fadda line is secretly a Gracie one. He said its origin cannot be traced, which is a different and narrower problem.",
        "BJJ Heroes' editor, Andre Borges, answered in the same article. He noted that books reference Franca as a student of both Maeda and Satake, that training in the early 1900s was not documented the way it is now, and that a wholly self-taught instructor seemed far-fetched to him; he allowed that Brazilian teachers may not have trained as long with their Japanese sources as they later said. Both men are describing the same gap. Neither produces a document from Franca's training.",
      ],
    },
    {
      id: "the-foot-lock",
      heading: "The foot lock, and where the claim comes from",
      paragraphs: [
        "The technical claim attached to Fadda's line is that his school was known for foot locks. BJJ Heroes lists it in his profile's favourite-technique field: his school was famous for using footlocks. The same page says his team won the challenge by making better use of that knowledge, and that Helio Gracie called it suburban technique, and it sources the remark to Reila Gracie's 2008 biography of Carlos Gracie. We have not read that biography.",
        "GracieMag's profile of Fadda does not mention foot locks. Nor does the 1955 newspaper page, which quotes Fadda at length about his students and his expectations without a word about what they would do. That is not evidence against the reputation. A man issuing a challenge had no reason to announce his game plan. It is evidence that the reputation rests, in the sources we could read, on one reference site citing one family biography written more than half a century later.",
        "What would settle it is a contemporary match report naming the finishes. The Hemeroteca Digital Brasileira, the national library's digitised newspaper archive, refused our requests, so none was read. Until one is, the fair statement is the narrow one. Fadda's line is associated with foot locks in the sport's reference sources; no one is credited here with inventing them, and the association is reported rather than confirmed.",
      ],
    },
    {
      id: "the-dates",
      heading: "The dates do not agree",
      paragraphs: [
        "BJJ Heroes dates the challenge to 1951 and places it in what it calls the Globo Jornal. A Brazilian judo blog that reproduces a long account of Fadda's career dates it to 1954 and names both O Globo and Diario da Noite. The Diario da Noite page is dated 14 January 1955. The quoted words in all three versions are recognisably the same sentence about respecting the Gracies without fearing them, and the same twenty students.",
        "The second famous quotation has the same problem. GracieMag reports that Helio Gracie told the Rio magazine Revista dos Esportes in 1955 that there had to be a Fadda, to show that jiu-jitsu was not a Gracie privilege. The judo blog gives the same words, in the same magazine, in 1954, and presents them as Helio's response after the challenge matches. If the challenge was issued in January 1955, a response to its outcome cannot have been printed in 1954. GracieMag's year is the one consistent with the newspaper.",
        "None of this changes the substance of the story. It does change what can be said with confidence. The one date we can document for the challenge is January 1955. The 1951 date is BJJ Heroes', and this site's own Figures entry on Fadda repeats it.",
      ],
    },
    {
      id: "the-line-now",
      heading: "What the line looks like now",
      paragraphs: [
        "GracieMag describes the Fadda academy as the largest source of opponents for the Carlos and Helio Gracie academy in the first jiu-jitsu tournaments, and records that when the Rio federation was founded in 1967, Fadda became its vice technical director under Carlson Gracie as director. At the time, it notes, bouts lasted five minutes with three of overtime and mount and takedowns scored one point. The same profile says his brother Humberto also became an instructor, and that Humberto's son, Helio Fadda, was named after Helio Gracie.",
        "The teams most often traced to Fadda today are Nova Uniao and GFTeam, both named on his BJJ Heroes page. For GFTeam there is a documented chain. BJJ Heroes gives Julio Cesar Pereira's lineage as Franca, then Fadda, then Monir Salomao, then Julio Cesar, and says he trained under Salomao until he received his black belt; GFTeam, which he co-founded and leads, was described by the Rio news site Diario do Rio in September 2026 as linked to the Oswaldo Fadda lineage.",
        "That is how a lineage survives: not as a style with a fixed set of moves, but as a sequence of named teachers, each of whom promoted the next. It is also why the missing link at the top matters less to the living line than to the history of it.",
      ],
    },
    {
      id: "what-a-contribution-claim-needs",
      heading: "What a contribution claim needs",
      paragraphs: [
        "Roberto Pedreira, writing on the Maeda myths, draws a distinction that applies directly here. Taking lessons from someone and being certified by them are different things, and by the looser standard every jiu-jitsu lineage goes back to Kano, and further. On that reading the question about Franca is not whether he ever met Maeda. It is who, if anyone, vouched for what he taught, and no source we read answers it for Franca any more than Pedreira finds it answered for Carlos Gracie.",
        "So the contribution this Journal can put its name to is modest and solid. Fadda taught jiu-jitsu in a Rio suburb from the early 1940s, opened an academy there in 1950, publicly challenged the Gracie academy in January 1955 in terms that were more respectful than the legend, sat on the technical side of the first Rio federation in 1967, and left a line of teachers that runs, through GFTeam among others, to academies open today. The foot-lock reputation and the result of the challenge are the parts everyone remembers. They are also the parts that still need a document.",
      ],
    },
  ],
  sources: [
    {
      title:
        "\"A Academia Fada de Jiu-Jitsu desafia os Gracie\", Diario da Noite (Rio de Janeiro), Friday 14 January 1955, p.2: page scan hosted on a public image host, masthead and date legible; not checked against a digitised original, as the Hemeroteca Digital Brasileira refused automated access",
      publisher: "Diario da Noite (scan via Imgur)",
      url: "https://imgur.com/a/GXokL",
      accessed: "2026-09-29",
    },
    {
      title:
        "Oswaldo Fadda: lineage, favourite technique field, biography (1921 birth, 1937 start, 1942 instructor grade, 27 January 1950 academy, 1951 challenge, 1967 federation)",
      publisher: "BJJ Heroes",
      url: "https://www.bjjheroes.com/bjj-fighters/oswaldo-fadda-facts-and-bio",
      accessed: "2026-09-29",
    },
    {
      title: "Luiz Franca: Satake, Maeda and Geo Omori as reported teachers",
      publisher: "BJJ Heroes",
      url: "https://www.bjjheroes.com/bjj-fighters/luiz-franca",
      accessed: "2026-09-29",
    },
    {
      title:
        "Oswaldo Fadda (profile, in Portuguese): 1921-2005, 1937 and 1942, January 1950 academy, Helio Gracie in Revista dos Esportes 1955, 1967 federation and period rules, Humberto and Helio Fadda",
      publisher: "GracieMag",
      url: "https://www.graciemag.com/academias/oswaldo-fadda/",
      accessed: "2026-09-29",
    },
    {
      title:
        "Drysdale on Fadda/Franca Lineage: 'No Evidence That They Learned From Maeda', with a response from BJJ Heroes' Andre Borges",
      publisher: "BJJ Eastern Europe",
      url: "https://www.bjjee.com/articles/drysdale-faddafranca-lineage-no-evidence-learned-maeda/",
      accessed: "2026-09-29",
    },
    {
      title:
        "\"Acabamos com o tabu dos Gracies\" Mestre Fadda (blog account in Portuguese: 1954 challenge in O Globo and Diario da Noite; Helio Gracie quotation dated 1954)",
      publisher: "Judo Tradicional Goshin Jutsu Kan (blog)",
      url: "http://judotradicionalgoshinjutsukan.blogspot.com/2010/04/acabamos-com-o-tabu-dos-gracies-mestre.html",
      accessed: "2026-09-29",
    },
    {
      title:
        "Top 20 Myths about Mitsuyo Maeda (Roberto Pedreira's text, as published): Myth 2, lessons versus certification",
      publisher: "sonnybrown.net",
      url: "https://www.sonnybrown.net/top-20-myths-about-mitsuyo-maeda/",
      accessed: "2026-09-29",
    },
    {
      title: "Julio Cesar Pereira: lineage Franca > Fadda > Monir Salomao > Julio Cesar Pereira; GF Team",
      publisher: "BJJ Heroes",
      url: "https://www.bjjheroes.com/bjj-fighters/mestre-julio-cezar-pereira",
      accessed: "2026-09-29",
    },
    {
      title:
        "Da Zona Norte do Rio para o mundo, GFTeam amplia alcance do jiu-jitsu e chega aos cinco continentes (Felipe Lucena, 19 September 2026)",
      publisher: "Diario do Rio",
      url: "https://diariodorio.com/esporte/2026/09/19/da-zona-norte-do-rio-para-o-mundo-gfteam-amplia-alcance-do-jiu-jitsu-e-chega-aos-cinco-continentes.html",
      accessed: "2026-09-29",
    },
  ],
  relatedSlugs: [
    "maeda-and-the-arrival-of-judo-in-brazil",
    "de-la-riva-and-the-guard-that-took-his-name",
  ],
  contestedNotes: [
    "The date of Fadda's challenge to the Gracie academy is given as 1951 by BJJ Heroes, as 1954 by a Brazilian judo blog, and as 14 January 1955 by the Diario da Noite page itself. This site's Figures entry on Fadda uses 1951 and should be checked against that page. The page was read from a scan on a public image host, not from a library copy; the Hemeroteca Digital Brasileira refused automated access on the accessed date.",
    "Helio Gracie's remark that there had to be a Fadda is dated 1955 by GracieMag and 1954 by the same blog, both in Revista dos Esportes. Neither the magazine nor its date was checked against an original.",
    "Whether Luiz Franca learned from Mitsuyo Maeda is unresolved. BJJ Heroes asserts it, with Satake and Geo Omori as further teachers, citing a Brazilian book series; Robert Drysdale says no evidence for it has been found; BJJ Heroes' editor argues that the absence of records is expected for the period.",
    "The association of Fadda's school with foot locks, and the report that his team won the challenge with them, rest in the sources read here on BJJ Heroes, which cites Reila Gracie's 2008 biography of Carlos Gracie. The biography was not read. No result of the challenge matches is stated in this piece: the accounts read here that give one are later retellings, and none cites a contemporary report of the bouts.",
    "A caption in the BJJ Eastern Europe article says the academy has been in its building since 1947. Both profiles date the academy to January 1950. The two may describe the building and the academy respectively; the piece uses 1950.",
  ],
};
