const performanceModule = (() => {
  const state = {
    employees: [],
    selectedEmployeeId: null,
  };

  const apiBase = '/api/performance';

  // Utility to create element
  function createElement(tag, attrs = {}, children = []) {
    const el = document.createElement(tag);
    Object.entries(attrs).forEach(([key, value]) => {
      if (key === 'className') el.className = value;
      else if (key === 'innerHTML') el.innerHTML = value;
      else el.setAttribute(key, value);
    });
    children.forEach(child => el.appendChild(child));
    return el;
  }

  async function fetchEmployeeList() {
    try {
      const response = await fetch(apiBase);
      if (!response.ok) throw new Error('Lỗi khi lấy dữ liệu nhân viên');
      const data = await response.json();
      state.employees = data;
      renderEmployeeList();
    } catch (err) {
      alert(err.message);
    }
  }

  function renderEmployeeList() {
    const container = document.getElementById('performance-employee-list');
    container.innerHTML = '';
    if (!state.employees.length) {
      container.textContent = 'Chưa có dữ liệu nhân viên.';
      return;
    }

    const ul = createElement('ul');
    state.employees.forEach(emp => {
      const li = createElement('li', {className: 'employee-item'});
      li.textContent = `${emp.name} - Đánh giá trung bình: ${emp.avg_rating ? Number(emp.avg_rating).toFixed(2) : '0.00'}`;
      li.style.cursor = 'pointer';
      li.onclick = () => {
        state.selectedEmployeeId = emp.id;
        renderAddReviewForm();
      };
      ul.appendChild(li);
    });
    container.appendChild(ul);
  }

  function renderAddReviewForm() {
    const container = document.getElementById('add-review-form');
    container.innerHTML = '';

    if (!state.selectedEmployeeId) {
      container.textContent = 'Vui lòng chọn nhân viên để đánh giá.';
      return;
    }

    const form = createElement('form');
    const ratingLabel = createElement('label', {for: 'rating-input', innerHTML: 'Điểm đánh giá (1-5): '});
    const ratingInput = createElement('input', {type: 'number', id: 'rating-input', min: '1', max: '5', required: true});

    const feedbackLabel = createElement('label', {for: 'feedback-input', innerHTML: 'Phản hồi: '});
    const feedbackInput = createElement('textarea', {id: 'feedback-input', rows: '3', required: true});

    const submitBtn = createElement('button', {type: 'submit', innerHTML: 'Gửi đánh giá'});

    form.appendChild(ratingLabel);
    form.appendChild(ratingInput);
    form.appendChild(createElement('br'));
    form.appendChild(feedbackLabel);
    form.appendChild(feedbackInput);
    form.appendChild(createElement('br'));
    form.appendChild(submitBtn);

    form.onsubmit = async e => {
      e.preventDefault();
      const rating = parseInt(ratingInput.value);
      const feedback = feedbackInput.value.trim();
      if (rating < 1 || rating > 5) {
        alert('Điểm đánh giá phải từ 1 đến 5');
        return;
      }
      if (!feedback) {
        alert('Vui lòng nhập phản hồi');
        return;
      }
      try {
        const response = await fetch(apiBase, {
          method: 'POST',
          headers: {'Content-Type': 'application/json'},
          body: JSON.stringify({
            action: 'add',
            employee_id: state.selectedEmployeeId,
            rating,
            feedback
          }),
        });

        const result = await response.json();
        if (result.error) {
          alert(`Lỗi: ${result.error}`);
        } else {
          alert('Đánh giá đã được gửi thành công');
          ratingInput.value = '';
          feedbackInput.value = '';
          state.selectedEmployeeId = null;
          container.innerHTML = '';
          fetchEmployeeList();
        }
      } catch (err) {
        alert('Lỗi khi gửi đánh giá');
      }
    };

    container.appendChild(form);
  }

  function init() {
    const appContainer = document.getElementById('performance-module');
    if (!appContainer) {
      console.error('Không tìm thấy container với id "performance-module"');
      return;
    }
    appContainer.innerHTML = `
      <h2>Danh sách nhân viên</h2>
      <div id="performance-employee-list"></div>
      <h3>Thêm đánh giá</h3>
      <div id="add-review-form"></div>
    `;
    fetchEmployeeList();
  }

  return { init };
})();

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('performance-module')) {
    performanceModule.init();
  }
});

export default performanceModule;
