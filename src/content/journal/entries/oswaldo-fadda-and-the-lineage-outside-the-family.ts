import type { DraftArticle } from "../types.ts";

/**
 * B3. Built around the only contemporary documents we could read: three pages
 * of the Rio newspaper Diario da Noite, page 2 of Friday 14, Wednesday 19 and
 * Monday 24 January 1955 (the challenge, Helio Gracie's acceptance and the
 * result). They were read from scans in an anonymous 2015 Imgur album titled
 * "Academia Gracie vs Academia Fada: the actual results"; mastheads, dates and
 * weekdays are legible and match 1955 and no nearby year. The Hemeroteca
 * Digital Brasileira refused automated requests with a 403, so none was checked
 * against a library copy. Translations from the Portuguese are ours. The
 * album's caption ("4 wins for Fada, 3 draws") misreads the printed headline;
 * the piece cites the headline.
 *
 * Those pages move the challenge from the 1951 that BJJ Heroes gives to January
 * 1955, and report a Gracie win (7 wins, 3 losses, 4 draws, with Fadda as
 * referee) where BJJ Heroes, citing Reila Gracie's biography, has Fadda's team
 * winning. The piece states the paper's result as the paper's, and reports the
 * other account as disputed. It agrees with the Figures entry as corrected on
 * 2026-09-29 (PR #65).
 *
 * Drysdale's position is reported from his own words. His 2019 GTR article
 * questions the non-Gracie label outright (a 1938 paper lists Franca for the
 * Gracie academy); the 2020 "it's a non Gracie one" restates the popular
 * premise before calling it "problematic". This matches the published Maeda
 * piece as corrected on 2026-09-29 (PR #68). No one is said to have
 * invented the foot lock, and the line is not compared with any other.
 *
 * Revised 2026-09-29 against the fact and voice audits on PR #61.
 *
 * Draft: no one has read and signed off this piece, so it carries no byline
 * and no date. AI-assisted pieces are published under the "Guard Theory
 * editorial" byline (owner, 2026-09-29), once a person has reviewed them.
 */
export const oswaldoFaddaAndTheLineageOutsideTheFamily: DraftArticle = {
  status: "draft",
  slug: "oswaldo-fadda-and-the-lineage-outside-the-family",
  category: "influential-practitioners",
  title: "Oswaldo Fadda, and the lineage called non-Gracie",
  metaTitle: "Oswaldo Fadda and the 'non-Gracie' lineage",
  standfirst:
    "The best-known teaching line in Brazilian jiu-jitsu said to run outside the Gracie academy is usually told in three facts: a suburb, a challenge and a foot lock. Three pages of one Rio newspaper from January 1955 confirm the first two, move the date and report a result the legend reverses; the third has no contemporary source we could find.",
  metaDescription:
    "Oswaldo Fadda's jiu-jitsu line, read from 1955 Rio newspaper pages and the sources that retell it: what is documented, what is dated wrongly, and what is not.",
  sections: [
    {
      id: "a-newspaper-page",
      heading: "Three newspaper pages, January 1955",
      paragraphs: [
        "Page 2 of the Rio de Janeiro paper Diario da Noite for Friday 14 January 1955 carries a two-column item under the headline \"A Academia Fada de Jiu-Jitsu desafia os Gracie\": the Fadda academy of jiu-jitsu challenges the Gracies. The paper spells the name with one d throughout. It reports that the professor Oswaldo Fada, director of the academy, of Bento Ribeiro, had come to the newsroom the day before to issue, through the paper, a challenge to what it calls the kings of jiu-jitsu.",
        "The quoted statement that follows is more careful than the retellings. Fadda says he wants his students to meet those of the Gracie academy, and that he is making the challenge public knowing it is a famous, traditional and powerful academy. \"We respect them as incomparable adversaries, but we do not fear them.\" He says he has no pretension of beating them, since famous fighters known around the world never had, and that he directs a modest academy whose students have no complexes; if they do not succeed, that will be one of the contingencies of sport. He has about twenty students for the bouts, and he leaves the time to the Gracie academy and the venue to the Gracies' discretion.",
        "On Wednesday 19 January the same paper reported that Helio Gracie had accepted, saying he was impressed by the chivalrous and sporting way the challenge was made, and that the bouts would be held at the Gracie academy at 8 p.m. on Friday the 21st. On Monday 24 January it reported the outcome under the headline \"Vitoriosa a Academia Gracie\": in 14 bouts the Gracie students won 7, drew 4 and lost 3. Fadda's students won the second, third and fourth bouts before the Gracie side recovered, and the referee, by the paper's account, was Oswaldo Fadda himself. The report names no finishes.",
        "Those three pages are the only contemporary documents about Fadda we could read. Everything else below is a later account.",
      ],
    },
    {
      id: "bento-ribeiro",
      heading: "Bento Ribeiro, and teaching where the sport was not",
      paragraphs: [
        "The outline of Fadda's life is agreed between the two reference sources that give one. BJJ Heroes and GracieMag both say he began training in 1937 under Luiz Franca while serving in the Brazilian marines, and received his black belt, or instructor grade, from Franca in 1942. Both describe him teaching by demonstration in public squares, church courtyards and outdoor venues, and both date his own academy to January 1950; BJJ Heroes gives the day as 27 January. BJJ Heroes gives his birth as 15 January 1921 in Bento Ribeiro, and GracieMag gives the years of his life as 1921 to 2005.",
        "The first newspaper page fits that outline. It places the academy in Bento Ribeiro, a suburb of the city, and it has Fadda describe his own school as modest. What it adds is tone. The man in the 1955 item is a suburban teacher using a newspaper to get a match with an academy the paper calls the kings of jiu-jitsu, and saying in print that he does not presume to beat it, though, he added, he had his hopes. Five days later the paper had Helio Gracie praising the way he asked.",
        "Robert Drysdale, who filmed at the academy for a documentary on the period, described Fadda, in remarks BJJ Eastern Europe reported in 2020, as one of the first to teach in the Rio suburbs, and as someone who taught disabled students and poor children and made gis himself to give them. None of that is a technical contribution. It is a claim about who was allowed into the room.",
      ],
    },
    {
      id: "luiz-franca",
      heading: "Luiz Franca's teachers",
      paragraphs: [
        "BJJ Heroes' Fadda page gives his lineage as Mitsuyo Maeda, then Luis Franca, then Fadda. Its page on Franca tells a longer story: that Franca trained for about a year at the Manaus academy of Soishiro Satake, another Kodokan judoka who had travelled with Maeda; that he then moved to Belem, where Maeda was based, and trained under him; that he later trained in Sao Paulo with Geo Omori; and that he settled on the outskirts of Rio, teaching army men including a young marine named Oswaldo Fadda. The page lists as its resources a book, O Livro Proibido do Jiu Jitsu, and four websites, one of them the judo blog cited below. Its own Fadda page qualifies Franca's instructor grade with the word allegedly, and its page on Franca opens by calling him a student of Satake and \"allegedly\" of Maeda, before telling the Maeda story without the qualifier.",
        "Drysdale's position, as BJJ Eastern Europe reported it, is that there is no evidence for any of it. If you look on the internet, he said, you will find Maeda and you will find Geo Mori, as he put it, as Franca's teachers, but researchers in Brazil have looked for that evidence for a long time without finding it, and his suspicion is that Franca was self-taught. In those remarks he restated the usual description, \"it's a non Gracie one\", only to call it \"problematic\": the line's origin, on his account, cannot be traced. He had gone further in a 2019 article of his own, citing a 1938 newspaper that lists Franca as fighting for the Gracie academy and a 1956 one calling him one of \"Helio Gracie's best students\", and concluding that \"the claim that it is a lineage outside of the Gracie family\" lacks any supporting evidence at the moment.",
        "BJJ Heroes' editor, Andre Borges, answered in the same article. He noted that books reference Franca as a student of both Maeda and Satake, that training in the early 1900s was not documented the way it is now, and that a wholly self-taught instructor seemed far-fetched to him; he allowed that Brazilian teachers may not have trained as long with their Japanese sources as they later said. Both men are describing the same gap. Neither produces a document from Franca's training.",
      ],
    },
    {
      id: "the-foot-lock",
      heading: "Where the foot-lock reputation comes from",
      paragraphs: [
        "The technical claim attached to Fadda's line is that his school was known for foot locks. BJJ Heroes lists it in his profile's favourite-technique field: his school was famous for using footlocks. The same page says his team won the challenge by making better use of that knowledge, and that Helio Gracie called it suburban technique, and it sources the remark to Reila Gracie's biography of Carlos Gracie. We have not read that biography. The Diario da Noite's report of the night, three days after the bouts, says the Gracie academy won, by 7 wins to 3 with 4 draws.",
        "GracieMag's profile of Fadda does not mention foot locks. Nor do the 1955 newspaper pages: the first quotes Fadda at length about his students and his expectations without a word about what they would do, and the report of the bouts names no technique. That is not evidence against the reputation. A man issuing a challenge had no reason to announce his game plan. It is evidence that the reputation rests, in the sources we could read, on one reference site citing one family biography written decades later.",
        "The one contemporary match report we read, the Diario da Noite of 24 January 1955, gives the score but names no finishes. Until a report that does turns up, Fadda's line is associated with foot locks in the sport's reference sources, and that association is reported here, not confirmed.",
      ],
    },
    {
      id: "the-dates",
      heading: "The dates do not agree",
      paragraphs: [
        "BJJ Heroes dates the challenge to 1951 and places it in what it calls the Globo Jornal. A Brazilian judo blog that reproduces a long account of Fadda's career dates it to 1954 and names both O Globo and Diario da Noite. The Diario da Noite page is dated 14 January 1955, and the paper's acceptance and result pages follow on the 19th and the 24th. The quoted words in all three versions are recognisably the same sentence about respecting the Gracies without fearing them, and the same twenty students.",
        "The second famous quotation has the same problem. GracieMag reports that Helio Gracie told the Rio magazine Revista dos Esportes in 1955 that there had to be a Fadda, to show that jiu-jitsu was not a Gracie privilege. The judo blog gives the same words, in the same magazine, in 1954, and presents them as Helio's response after the challenge matches. A response to the outcome of a January 1955 challenge cannot have been printed in 1954, but nothing read here confirms 1955 either. Neither date could be checked against the magazine, and the blog's own text has Fadda in jiu-jitsu for \"more than twenty years\", which, with the 1937 start both profiles give, fits a later interview.",
        "The substance of the story stands. What can be said with confidence is narrower: the one date we can document for the challenge is January 1955, and the one contemporary result is a Gracie win. The 1951 date is BJJ Heroes'.",
      ],
    },
    {
      id: "the-line-now",
      heading: "What the line looks like now",
      paragraphs: [
        "GracieMag describes the Fadda academy as the largest source of opponents for the Carlos and Helio Gracie academy in the first jiu-jitsu tournaments, and records that when the Rio federation was founded in 1967, Fadda became its vice technical director under Carlson Gracie as director. At the time, it notes, bouts lasted five minutes with three of overtime and mount and takedowns scored one point. The same profile says his brother Humberto also became an instructor, and that Humberto's son, Helio Fadda, was named after Helio Gracie.",
        "The teams most often traced to Fadda today are Nova Uniao and GFTeam, both named on his BJJ Heroes page. For GFTeam there is a documented chain. BJJ Heroes gives Julio Cesar Pereira's lineage as Franca, then Fadda, then Monir Salomao, then Julio Cesar, and says he trained under Salomao until he received his black belt. The Rio news site Diario do Rio, in September 2026, describing him as the leader of GFTeam, traced the team's origin to the Salomao academy in Vila da Penha (it spells the name Muniz Salomao), which it described as linked to the Oswaldo Fadda lineage.",
        "What survives is a sequence of named teachers, each of whom promoted the next, which is why the missing link at the top matters more to the history than to the academies.",
      ],
    },
    {
      id: "what-a-contribution-claim-needs",
      heading: "What a contribution claim needs",
      paragraphs: [
        "Roberto Pedreira, writing on the Maeda myths, separates taking lessons from someone and being certified by them, and by the looser standard every jiu-jitsu lineage goes back to Kano, and further. On that reading, the question about Franca is who, if anyone, vouched for what he taught, whether or not he ever met Maeda, and no source we read answers it for Franca any more than Pedreira finds it answered for Carlos Gracie.",
        "Fadda taught jiu-jitsu in a Rio suburb from the early 1940s, opened an academy there in 1950, publicly challenged the Gracie academy in January 1955 in terms that were more respectful than the legend, lost the match by the paper's count, sat on the technical side of the first Rio federation in 1967, and left a line of teachers that runs, through GFTeam among others, to academies open today. The foot-lock reputation and a Fadda victory are the parts everyone remembers. The one contemporary report of the night records a Gracie win, and the foot locks still need a document.",
      ],
    },
  ],
  sources: [
    {
      title:
        "Diario da Noite (Rio de Janeiro), p.2 of 14, 19 and 24 January 1955: the challenge, Helio Gracie's acceptance and the result (scans in an anonymous 2015 album, mastheads and dates legible; not checked against a library copy, as the Hemeroteca Digital Brasileira refused automated access)",
      publisher: "Diario da Noite (scans via Imgur)",
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
      title: "Luiz Franca: Satake and 'allegedly' Maeda, Geo Omori, and the resources the page lists",
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
        "Robert Drysdale, \"Is the Fadda lineage a Non-Gracie lineage?\", 1 January 2019: cites Jornal do Brasil, 2 November 1938, listing \"Luis Franca (A. Gracie)\", and a 1956 article calling Franca one of \"Helio Gracie's best students\" (archived copy)",
      publisher: "Global Training Report, via the Internet Archive",
      url: "https://web.archive.org/web/20200115191155/http://global-training-report.com/drysdale_2019_1.htm",
      accessed: "2026-09-29",
    },
    {
      title: "Drysdale Questions If Fadda lineage is a Non-Gracie lineage (7 January 2019)",
      publisher: "BJJ Eastern Europe",
      url: "https://www.bjjee.com/articles/drysdale-explains-fadda-lineage-a-non-gracie-lineage/",
      accessed: "2026-09-29",
    },
    {
      title: "Robert Drysdale: The Fadda Lineage Could Actually Be a Gracie One! (interview, 10 October 2019)",
      publisher: "BJJ Eastern Europe",
      url: "https://www.bjjee.com/articles/robert-drysdale-the-fadda-lineage-could-actually-be-a-gracie-one/",
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
    "The date of Fadda's challenge to the Gracie academy is given as 1951 by BJJ Heroes, as 1954 by a Brazilian judo blog, and as 14 January 1955 by the Diario da Noite page itself, whose acceptance and result pages follow on 19 and 24 January. The pages were read from scans in an anonymous 2015 upload on a public image host, not from a library copy; the Hemeroteca Digital Brasileira refused automated access on the accessed date. Their printed weekdays match 1955 and no nearby year.",
    "Helio Gracie's remark that there had to be a Fadda is dated 1955 by GracieMag and 1954 by the same blog, both in Revista dos Esportes. Neither the magazine nor its date was checked against an original, and the blog's own text, which has Fadda in jiu-jitsu for more than twenty years, fits a later interview than either.",
    "Whether Luiz Franca learned from Mitsuyo Maeda is unresolved. BJJ Heroes tells it, while calling the Maeda link 'alleged' in its own opening line, with Satake and Geo Omori as further teachers, listing as its resources a Brazilian book and four websites; Robert Drysdale says no evidence for it has been found; BJJ Heroes' editor argues that the absence of records is expected for the period.",
    "Whether the line is outside the Gracie family at all is itself questioned. Drysdale's 2019 article cites a 1938 newspaper listing Franca for the Gracie academy and a 1956 one calling him one of Helio Gracie's best students, and says the evidence available suggests Franca was a Gracie academy student; neither newspaper was read for this piece.",
    "The result of the challenge is disputed. The only contemporary report read (Diario da Noite, 24 January 1955) gives the Gracie academy 7 wins, 3 losses and 4 draws, with Fadda as referee. BJJ Heroes, citing Reila Gracie's biography of Carlos Gracie, and the judo blog both say Fadda's team won. The association of Fadda's school with foot locks rests, in the sources read here, on BJJ Heroes; the biography was not read.",
    "An Instagram caption from Drysdale's documentary account, embedded in the 2020 BJJ Eastern Europe article, says the academy has been in its building since 1947. Both profiles date the academy to January 1950. The two may describe the building and the academy respectively; the piece uses 1950.",
  ],
};
