'use strict';
const checkbox = document.getElementById('update_checkbox');
const updateForm = document.getElementById('detail_page_update_side');
const updateLabels = document.getElementById('book_detail_form_update');

function updateBook(){
  if(!checkbox.checked){
    updateForm.setAttribute('style', 'display:none;');
    updateLabels.setAttribute('style', 'display:none;');
  }else{
    updateForm.setAttribute('style', 'display:flex;');
    updateLabels.setAttribute('style', 'display:flex;');
  }
}


checkbox.addEventListener('click', updateBook);


