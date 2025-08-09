document.addEventListener('DOMContentLoaded', () => {
    const roomContainer = document.querySelector('.room-container');
    const modal = document.getElementById('roomModal');
    const closeModalButton = document.querySelector('.close-button');
    const roomForm = document.getElementById('roomForm');
    const roomNumberInput = document.getElementById('roomNumberInput');
    const roomNumberDisplay = document.getElementById('roomNumberDisplay');
    const modalTitle = document.getElementById('modal-title');
    const submitButton = document.querySelector('#roomForm button[type="submit"]');

    const statusSelect = document.getElementById('status');
    const customerNameInput = document.getElementById('customerName');
    const phoneNumberInput = document.getElementById('phoneNumber');
    const dateInput = document.getElementById('date');
    const paymentInput = document.getElementById('payment'); 
    const notesTextarea = document.getElementById('notes');

    const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwFUtYMEihAUMKhNJSGeJvkWIPiJvXXMx6obggVK-dLHxP7f8NQYFH2l65FbWOyFbQ/exec';

    let rooms = [];

    async function fetchRooms() {
        try {
            const response = await fetch(SCRIPT_URL);
            const data = await response.json();
            
            rooms = data.map(item => ({
                roomNumber: item['หมายเลขห้อง'],
                status: item['สถานะห้อง'],
                customerName: item['ชื่อลูกค้า'],
                phoneNumber: item['เบอร์โทรศัพท์'],
                date: item['วันที่'],
                payment: item['จำนวนเงิน'],
                notes: item['หมายเหตุ']
            }));

            renderRooms();
        } catch (error) {
            console.error('Failed to fetch room data:', error);
            alert('ไม่สามารถดึงข้อมูลห้องจาก Google Sheet ได้');
        }
    }

    function renderRooms() {
        roomContainer.innerHTML = '';
        rooms.forEach(room => {
            const roomDiv = document.createElement('div');
            roomDiv.classList.add('room', `status-${room.status}`);
            roomDiv.dataset.roomNumber = room.roomNumber;
            
            let roomInfo = `<h3>ห้อง ${room.roomNumber}</h3>
                            <p class="room-status">${room.status}</p>`;

            // แสดงชื่อลูกค้าเมื่อสถานะเป็น "จอง" หรือ "ไม่ว่าง"
            if ((room.status === 'ไม่ว่าง' || room.status === 'จอง') && room.customerName) {
                roomInfo += `<p class="room-owner">${room.customerName}</p>`;
            } 
            
            // เปลี่ยนเงื่อนไขใหม่: แสดงวันที่เมื่อสถานะเป็น "ว่าง" หรือ "จอง"
            if ((room.status === 'ว่าง' || room.status === 'จอง') && room.date) {
                const roomDate = new Date(room.date);
                const formattedDate = roomDate.toLocaleDateString('th-TH', {
                    year: 'numeric',
                    month: '2-digit',
                    day: '2-digit'
                }).replace(/\//g, '-');
                roomInfo += `<p class="room-date">${formattedDate}</p>`;
            }

            // แสดงจำนวนเงินเมื่อสถานะเป็น "จอง" หรือ "ไม่ว่าง"
            if ((room.status === 'จอง' || room.status === 'ไม่ว่าง') && room.payment) {
                roomInfo += `<p class="room-payment">฿ ${room.payment}</p>`;
            }

            roomDiv.innerHTML = roomInfo;

            roomDiv.addEventListener('click', () => {
                openModal(room);
            });
            roomContainer.appendChild(roomDiv);
        });
    }

    function openModal(room) {
        modalTitle.textContent = `ข้อมูลห้อง ${room.roomNumber}`;
        roomNumberInput.value = room.roomNumber;
        roomNumberDisplay.textContent = room.roomNumber;

        statusSelect.value = room.status;
        customerNameInput.value = room.customerName;
        phoneNumberInput.value = room.phoneNumber;
        dateInput.value = room.date;
        paymentInput.value = room.payment;
        notesTextarea.value = room.notes;

        function toggleInputStatus() {
            if (statusSelect.value === 'ว่าง') {
                customerNameInput.value = '';
                customerNameInput.disabled = true;
                customerNameInput.classList.add('disabled-input');
                phoneNumberInput.value = '';
                phoneNumberInput.disabled = true;
                phoneNumberInput.classList.add('disabled-input');
                paymentInput.value = '';
                paymentInput.disabled = true;
                paymentInput.classList.add('disabled-input');
                notesTextarea.value = '';
                notesTextarea.disabled = true;
                notesTextarea.classList.add('disabled-input');
            } else {
                customerNameInput.disabled = false;
                customerNameInput.classList.remove('disabled-input');
                phoneNumberInput.disabled = false;
                phoneNumberInput.classList.remove('disabled-input');
                paymentInput.disabled = false;
                paymentInput.classList.remove('disabled-input');
                notesTextarea.disabled = false;
                notesTextarea.classList.remove('disabled-input');
            }
        }

        toggleInputStatus();
        statusSelect.onchange = toggleInputStatus;

        modal.style.display = 'block';
    }

    closeModalButton.addEventListener('click', () => {
        modal.style.display = 'none';
    });

    window.addEventListener('click', (event) => {
        if (event.target == modal) {
            modal.style.display = 'none';
        }
    });

    roomForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        
        const originalButtonText = submitButton.textContent;
        const originalButtonColor = submitButton.style.backgroundColor;
        
        submitButton.textContent = 'กำลังบันทึกข้อมูล';
        submitButton.style.backgroundColor = 'red';
        submitButton.disabled = true;
        submitButton.classList.add('blinking');

        const roomNumber = roomNumberInput.value;
        const customerName = customerNameInput.value;
        const phoneNumber = phoneNumberInput.value;
        const status = statusSelect.value;
        const date = dateInput.value;
        const payment = paymentInput.value;
        const notes = notesTextarea.value;
        
        const formData = new FormData();
        formData.append('หมายเลขห้อง', roomNumber);
        formData.append('ชื่อลูกค้า', customerName);
        formData.append('เบอร์โทรศัพท์', phoneNumber);
        formData.append('สถานะห้อง', status);
        formData.append('วันที่', date);
        formData.append('จำนวนเงิน', payment);
        formData.append('หมายเหตุ', notes);

        try {
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                body: formData
            });
            const data = await response.json();
            
            console.log('บันทึกข้อมูลสำเร็จ:', data);
            alert('บันทึกข้อมูลเรียบร้อยแล้ว!');

            await fetchRooms();

            modal.style.display = 'none';
        } catch (error) {
            console.error('เกิดข้อผิดพลาดในการบันทึกข้อมูล:', error);
            alert('เกิดข้อผิดพลาดในการบันทึกข้อมูล!');
        } finally {
            submitButton.textContent = originalButtonText;
            submitButton.style.backgroundColor = originalButtonColor;
            submitButton.disabled = false;
            submitButton.classList.remove('blinking');
        }
    });

    fetchRooms();
});
