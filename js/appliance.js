// script.js
document.querySelectorAll('.choice-group').forEach(group => {
  group.addEventListener('click', e => {
    if (!e.target.classList.contains('choice')) return;

    const isStatementGroup = group.previousElementSibling.textContent
      .trim()
      .toLowerCase()
      .includes('statement');

    if (isStatementGroup) {
      // Only one button can be active for "statement"
      group.querySelectorAll('.choice').forEach(btn => btn.classList.remove('active'));
      e.target.classList.add('active');
    } else {
      // Toggle freely for multi-select groups
      e.target.classList.toggle('active');
    }
  });
});
