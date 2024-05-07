//baseURL for the Jeoparady API
const baseUrl = "https://jeopardy-api-08c22fd2e683.herokuapp.com";
//Number of the categories what I need to use
const NUM_CATEGORIES = 13; //
const NUM_CAT_FOR_ROW =6; //
//number of the clues for each category
const NUM_CLUES_PER_CAT = 5;  //
const categoryIds = [];


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


/** Get NUM_CATEGORIES random category from API.
 *
 * Returns array of category ids
 */
async function getCategoryIds() {
  try {
    const response = await axios.get(`${baseUrl}/api/categories`, {
      headers: {
        'Content-Type': 'application/json'
      },
      params: {
        count: NUM_CATEGORIES //13
      }
    });
    const categoryIds = response.data.categories.map(category => category.id);
    return getRandomCategoryIds(shuffleArray(categoryIds), NUM_CAT_FOR_ROW);
  } catch (error) {
    console.error('There was an error!', error);
    return [];
  }
}

//shuffle function for the array of Ids

function shuffleArray(array) {
  for (let i = array.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array;
}
// extract the ids as number of Cateogories
function getRandomCategoryIds(array, NUM_CAT_FOR_ROW) {
  const shuffledArray = shuffleArray(array);
  return shuffledArray.slice(0, NUM_CAT_FOR_ROW);
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


// OCCUPATION FUNCTION FOR CHECK
// async function practiceFunction() {
//   const ids = await getCategoryIds();
//   const categories1 = [];

//   for (const id of ids) {
//     try {
//       const response = await axios.get(`${baseUrl}/api/details/${id}`, {
//         headers: {
//           'Content-Type': 'application/json'
//         }
//       });
//       const category = response.data.details[id];
//       const title = category.title
//       const clues = category.clues;
//       const answers = clues.map(clue => ({
//         question: clue.question,
//         answer: clue.answer,
//         showing: null
//       }));
      
//       categories1.push({id,title, answers}); 
//     } catch (error) {
//       console.error('Error fetching category details:', error);
//     }
//   }
//   console.log(categories1);  // 
// }

//Function for the category detail by ID
async function getCategory(id) {
    try {
      const response = await axios.get(`${baseUrl}/api/details/${id}`, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      const category = response.data.details[id];
      const title = category.title
      const clues = category.clues;
      const answers = clues.map(clue => ({
        clue: clue.question,
        answer: clue.answer,
        showing: null
      }));
      
      categories.push({id,title, answers});  // 
      
    } catch (error) {
      console.error('Error fetching category details:', error);
    }  

  }



/** Fill the HTML table#jeopardy with the categories & cells for questions.
 *
 * - The <thead> should be filled w/a <tr>, and a <td> for each category
 * - The <tbody> should be filled w/NUM_QUESTIONS_PER_CAT <tr>s,
 *   each with a question for each category in a <td>
 *   (initally, just show a "?" where the question/answer would go.)
 */


async function fillTable(categories) {
  //use jquery to select thead and tbody
  const $thead = $('#gameTable thead');
  const $tbody = $('#gameTable tbody');

  //make them empty
  $thead.empty();
  $tbody.empty();


  //fill the thead with title
 const $tr = $('<tr>');
categories.forEach((category)=> 
  $tr.append($('<th>').text(category.title)))
 $thead.append($tr);

  //fill the tbody with questions

  for (let i = 0; i < NUM_CLUES_PER_CAT; i++) {
  const $row = $('<tr>');
for (const category of categories) {
      $row.append($('<td>').data('category', category.title).data('clue', i).text('🌜🧡🌞'));
  }
  $tbody.append($row);
}}

/** Handle clicking on a clue: show the question or answer.
 *
 * Uses .showing property on clue to determine what to show:
 * - if currently null, show question & set .showing to "question"
 * - if currently "question", show answer & set .showing to "answer"
 * - if currently "answer", ignore click
 * */



  function handleClick(event) {
    const $cell = $(event.target); 
    const categoryTitle = $cell.data('category');  
    const clueIndex = $cell.data('clue');  
    const category = categories.find(cat => cat.title === categoryTitle);
    if (!category) {
        console.error('Category not found');
        return;
    }

    const clue = category.answers[clueIndex];
    if (!clue) {
        console.error('Clue not found');
        return;
    }


    switch (clue.showing) {
        case null://First Click= question
            clue.showing = 'question';
            $cell.text(clue.clue);
            break;
        case 'question':
            // click question: answer
            clue.showing = 'answer';
            $cell.text(clue.answer);
            $cell.addClass("disabled")
            break;
            
        case 'answer':
            // no more response after answer
            break;
    }
}


/** Wipe the current Jeopardy board, show the loading spinner,
 * and update the button used to fetch data.
 */

function showLoadingView() {
  $("#gameTable thead").empty();
  $("#gameTable tbody").empty();
  $("#spin-container").show();
  $("#start")
    .addClass("disabled")
    .text("Loading...");
}
/** Remove the loading spinner and update the button used to fetch data. */

function hideLoadingView() {
  $("#start")
  .removeClass("disabled")
  .text("Restart!");
$("#spin-container").hide();
}

/** Start game:
 * 
 *
 * - get random category Ids
 * - get data for each category
 * - create HTML table
 * */
const categories = [];
async function setupAndStart() {
  let isLoading = $("#start").text() === "Loading...";
  if(!isLoading){
  showLoadingView();
  try {
    categories.length = 0; // reset the categories
    const ids = await getCategoryIds();
    // console.log(ids) // 6 numbers of ids in an array
    for (const id of ids){
      const categoryDetail = await getCategory(id);
      if (categoryDetail){
        categories.push(categoryDetail);
      }
    }
    fillTable(categories);
    
  } catch (error){
    console.error("Setup failed:", error);
  }}
  hideLoadingView();
}




/** On click of start / restart button, set up game. */
$("#start").on("click", setupAndStart);

 

$(document).ready(function() {
  $('#gameTable').on('click', 'td', handleClick);
});