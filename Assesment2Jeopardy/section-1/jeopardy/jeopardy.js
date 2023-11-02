// categories is the main data structure for the app; it looks like this:

//  [
//    { title: "Math",
//      clues: [
//        {question: "2+2", answer: 4, showing: null},
//        {question: "1+1", answer: 2, showing: null}
//        ...
//      ],
//    },
//    { title: "Literature",
//      clues: [
//        {question: "Hamlet Author", answer: "Shakespeare", showing: null},
//        {question: "Bell Jar Author", answer: "Plath", showing: null},
//        ...
//      ],
//    },
//    ...
//  ]
const BASE_API_URL= "https://jservice.io/api/";
const NUM_CATEGORIES = 6;
const NUM_QUESTIONS_PER_CAT = 5;


let categories = [];
$("#spin-container").toggle();

/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */

async function getCategoryIds() {
    let res = await axios.get(`${BASE_API_URL}categories?count=100`);
    let catIds = res.data.map(c => c.id);
    return _.sampleSize(catIds, NUM_CATEGORIES);
}

/** Return object with data about a category:
 *
 *  Returns { title: "Math", clues: clue-array }
 *
 * Where clue-array is:
 *   [
 *      {question: "Hamlet Author", answer: "Shakespeare", showing: null},
 *      {question: "Bell Jar Author", answer: "Plath", showing: null},
 *      ...
 *   ]
 */

async function getCategory(catId) {
    let res = await axios.get(`${BASE_API_URL}category?id=${catId}`);
    let cat = res.data;
    let totalClues = cat.clues;
    let randomClues = _.sampleSize(totalClues, NUM_QUESTIONS_PER_CAT);
    let clues = randomClues.map(c => ({
        question: c.question,
        answer: c.answer,
        showing: null,
    }));

    return {title: cat.title, clues};
}

/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */




async function fillTable() {
    // Adds row with random headers for the categories
    $("#jeopardy thead").empty();
    let $tr = $("<tr>");
    for (let catIndex = 0; catIndex < NUM_CATEGORIES; catIndex++) {
        $tr.append($("<th>").text(categories[catIndex].title));
    }
    $("#jeopardy thead").append($tr);

    // Adds rows with a question for each category
    $("#jeopardy tbody").empty();
    for (let clueIndex = 0; clueIndex < NUM_QUESTIONS_PER_CAT; clueIndex++) {
        let $tr = $("<tr>");
        for (let catIndex = 0; catIndex < NUM_CATEGORIES; catIndex++) {
            $tr.append($("<td>").attr("id", `${catIndex}-${clueIndex}`).text("?"));
        }
        $("#jeopardy tbody").append($tr);
    }
}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */

function handleClick(evt) {
    let id = evt.target.id;
    let [catId, clueId] = id.split("-");
    let clue = categories[catId].clues[clueId];

    let msg;

    if (!clue.showing) {
        msg = clue.question;
        clue.showing = "question";
    } else if (clue.showing === "question") {
        msg = clue.answer;
        clue.showing = "answer";
    } else {
        return
    }

    // Update text of cell
    $(`#${catId}-${clueId}`).html(msg);
}



/** Start game:
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */

async function setupAndStart() {
    $("#spin-container").toggle();
    $("#jeopardy").toggle();
    let catIds = await getCategoryIds();
  
    categories = [];
  
    for (let catId of catIds) {
      categories.push(await getCategory(catId));
    }
  
    fillTable();
    $("#spin-container").toggle();
    $("#jeopardy").toggle();
  }
  
  /** On click of restart button, restart game. */
  
  $("#restart").on("click", setupAndStart);
  $("#start").on("click", setupAndStart);
  
  /** On page load, setup and start & add event handler for clicking clues */
  
  $(async function () {
      
      $("#jeopardy").on("click", "td", handleClick);
    }
  ); 