// script.js
document.querySelectorAll('.choice-group').forEach(group => {
  group.addEventListener('click', e => {
    if (!e.target.classList.contains('choice')) return;

    // Find the label - could be previous sibling or parent's previous sibling
    let labelText = '';
    const prevSibling = group.previousElementSibling;
    if (prevSibling) {
      if (prevSibling.tagName === 'LABEL') {
        labelText = prevSibling.textContent.trim().toLowerCase();
      } else if (prevSibling.classList.contains('form-group')) {
        const formGroupLabel = prevSibling.previousElementSibling;
        if (formGroupLabel && formGroupLabel.tagName === 'LABEL') {
          labelText = formGroupLabel.textContent.trim().toLowerCase();
        }
      }
    }
    if (!labelText && group.parentElement) {
      const parentPrev = group.parentElement.previousElementSibling;
      if (parentPrev && parentPrev.tagName === 'LABEL') {
        labelText = parentPrev.textContent.trim().toLowerCase();
      }
    }

    // Single-select for: property, service, statement, contact method
    const isSingleSelect = labelText.includes('property') || 
                          labelText.includes('service') || 
                          labelText.includes('statement') ||
                          labelText.includes('contact method') ||
                          labelText.includes('furniture included');

    if (isSingleSelect) {
      // Only one button can be active
      group.querySelectorAll('.choice').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
    } else {
      // Toggle freely for multi-select groups
      e.target.classList.toggle('active');
    }
  });
});
