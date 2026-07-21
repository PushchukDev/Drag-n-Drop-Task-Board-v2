const addBtns = document.querySelectorAll('.add-btn:not(.solid)');
const saveItemBtns = document.querySelectorAll('.solid');
const addItemContainers = document.querySelectorAll('.add-container');
const addItems = document.querySelectorAll('.add-item');

//lists
const listColumns = document.querySelectorAll('.drag-item-list');
const backlogListEl = document.getElementById('backlog-list');
const progressListEl = document.getElementById('progress-list');
const completeListEl = document.getElementById('complete-list');
const onHoldListEl = document.getElementById('on-hold-list');

//items
let updatedOnLoad = false;

//arrays
let backlogListArray = [];
let progressListArray = [];
let completeListArray = [];
let onHoldListArray = [];
let listArrays = [];

//drag func
let draggedItem;
let dragging = false;
let currentColumn;

function getSavedColumns() {
  if (localStorage.getItem('backlogItems')) {
    backlogListArray = JSON.parse(localStorage.backlogItems);
    progressListArray = JSON.parse(localStorage.progressItems);
    completeListArray = JSON.parse(localStorage.completeItems);
    onHoldListArray = JSON.parse(localStorage.onHoldItems);
  } else {
    backlogListArray = ['Sit back and relax'];
    progressListArray = ['Work on projects', 'Watch some videos'];
    completeListArray = ['Call mom'];
    onHoldListArray = ['Paint like Picasso'];
  }
}

getSavedColumns();
updateSavedColumns();

//set localStorage arrays
function updateSavedColumns() {
  listArrays = [
    backlogListArray,
    progressListArray,
    completeListArray,
    onHoldListArray,
  ];
  const arrayNames = ['backlog', 'progress', 'complete', 'onHold'];
  arrayNames.forEach((arrayName, index) => {
    localStorage.setItem(
      `${arrayName}Items`,
      JSON.stringify(listArrays[index])
    );
  });
}
//filter arrays to remove empty items
function filterArray(array) {
  //   console.log(array);
  const filteredArray = array.filter((item) => item !== null);
  //   console.log(filteredArray);
  return filteredArray;
}

//create dom elements for each list item
function createItemEl(columnEl, column, item, index) {
  //list item
  const listEl = document.createElement('li');
  listEl.classList.add('drag-item');
  listEl.textContent = item;
  listEl.draggable = true;
  listEl.setAttribute('ondragstart', 'drag(event)');
  listEl.contentEditable = true;
  listEl.id = index;
  listEl.setAttribute('onfocusout', `updateItem(${index},${column})`);
  //append
  columnEl.appendChild(listEl);
}

function updateDOM() {
  //check local storage
  if (!updatedOnLoad) {
    getSavedColumns();
  }
  //reset columns
  backlogListEl.textContent = '';
  backlogListArray.forEach((backlogItem, index) => {
    createItemEl(backlogListEl, 0, backlogItem, index);
  });
  backlogListArray = filterArray(backlogListArray);

  progressListEl.textContent = '';
  progressListArray.forEach((progressItem, index) => {
    createItemEl(progressListEl, 1, progressItem, index);
  });
  progressListArray = filterArray(progressListArray);

  completeListEl.textContent = '';
  completeListArray.forEach((completeItem, index) => {
    createItemEl(completeListEl, 2, completeItem, index);
  });
  completeListArray = filterArray(completeListArray);

  onHoldListEl.textContent = '';
  onHoldListArray.forEach((onHoldItem, index) => {
    createItemEl(onHoldListEl, 3, onHoldItem, index);
  });
  onHoldListArray = filterArray(onHoldListArray);

  updatedOnLoad = true;
  updateSavedColumns();
}

//update item, delete if empty, change upon edit
function updateItem(id, column) {
  const selectedArray = listArrays[column];
  const selectedColumnEl = listColumns[column].children;
  if (!dragging) {
    if (!selectedColumnEl[id].textContent) {
      delete selectedArray[id];
    } else {
      selectedArray[id] = selectedColumnEl[id].textContent;
    }
    //   console.log(selectedArray);
    updateDOM();
  }
}

//add to column list, reset text_box
function addToColumn(column) {
  const itemText = addItems[column].textContent;
  const selectedArray = listArrays[column];
  selectedArray.push(itemText);
  addItems[column].textContent = '';
  updateDOM();
}

//show add item input box
function showInputBox(column) {
  addBtns[column].style.visibility = 'hidden';
  saveItemBtns[column].style.display = 'flex';
  addItemContainers[column].style.display = 'flex';
}

//hide item input box
function hideInputBox(column) {
  addBtns[column].style.visibility = 'visible';
  saveItemBtns[column].style.display = 'none';
  addItemContainers[column].style.display = 'none';
  addToColumn(column);
}

//allows arrays to reflect drag n'drop items
function rebuilArrays() {
  //   console.log(backlogListEl.children);
  backlogListArray = Array.from(backlogListEl.children).map(
    (i) => i.textContent
  );
  progressListArray = Array.from(progressListEl.children).map(
    (i) => i.textContent
  );
  completeListArray = Array.from(completeListEl.children).map(
    (i) => i.textContent
  );
  onHoldListArray = Array.from(onHoldListEl.children).map((i) => i.textContent);

  updateDOM();
}

//when item starts dragging
function drag(e) {
  draggedItem = e.target;
  dragging = true;
  //   console.log('draggedItem:', draggedItem);
}

function allowDrop(e) {
  e.preventDefault();
}

function dragEnter(column) {
  listColumns[column].classList.add('over');
  currentColumn = column;
}

//dropping item in column
function drop(e) {
  e.preventDefault();
  listColumns.forEach((column) => {
    column.classList.remove('over');
  });
  //add item to column
  const parent = listColumns[currentColumn];
  parent.appendChild(draggedItem);
  //dragging complete
  dragging = false;
  rebuilArrays();
}

//on load
updateDOM();
