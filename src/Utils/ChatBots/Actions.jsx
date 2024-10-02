import axios from 'axios';

class ActionProvider {
  constructor(createChatBotMessage, setStateFunc) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
  }

  handleDefault() {
    const botMessage = this.createChatBotMessage(
      'Xin lỗi, tôi không hiểu rõ ý của bạn. Bạn có thể diễn đạt lại được không?'
    );
    this.updateChatbotState(botMessage);
  }

  handleHelpPaymenty() {
    const botMessage = this.createChatBotMessage(
      'Chúng tôi hỗ trợ thanh toán online nhiều loại ngân hàng MB, VIB, BIDV,... '
    );
    this.updateChatbotState(botMessage);
  }
  handleGiaoHang() {
    const botMessage = this.createChatBotMessage(
      'Chúng tôi hỗ trợ giao hàng toàn quốc với chi phí ưu đai từ 10000VND đến 30000VND'
    );
    this.updateChatbotState(botMessage);
  }
  handleDonHangHomQua () {
    const botMessage = this.createChatBotMessage(
      'Chúng tôi hỗ trợ giao hàng toàn quốc với chi phí ưu đai từ 10000VND đến 30000VND'
    );
    this.updateChatbotState(botMessage);
  }
  
  async handleCheckOrder() {
    const username = 'thangth7';
    const url = `http://127.0.0.1:8080/manager/order/api/getlist/user?name=${username}`;

    try {
        const response = await axios.get(url);

        if (response.data && response.data.code === 0 && response.data.body && response.data.body.length > 0) {
            const orders = response.data.body;

            const filteredOrders = orders.filter(order => {
                const statusFilter = [11, 13, 17, 19, 21]; // Define the statuses you want to include
                return statusFilter.includes(order.status);
            });

            if (filteredOrders.length > 0) {
                const botMessages = filteredOrders.map(order => {
                    const orderId = order.order_id;

                    // Map order status to a readable format
                    const statusMapping = {
                        11: "Đang chờ xác nhận",
                        13: "Đang chờ thanh toán online",
                        17: "Đang chuẩn bị đơn hàng",
                        19: "Đang vận chuyển",
                        21: "Đang giao hàng"
                    };
                    const status = statusMapping[order.status] || "Trạng thái không xác định";

                    return this.createChatBotMessage(`Bạn có đơn hàng mã ${orderId}. ✅ Trạng thái: ${status}.`);
                  });

                // Update chatbot with each filtered order message
                botMessages.forEach(botMessage => this.updateChatbotState(botMessage));
            } else {
                // No orders found with the specified statuses
                const botMessage = this.createChatBotMessage('Không tìm thấy đơn hàng phù hợp với trạng thái.');
                this.updateChatbotState(botMessage);
            }
        } else {
            // No order information found
            const botMessage = this.createChatBotMessage('Không tìm thấy đơn hàng của bạn.');
            this.updateChatbotState(botMessage);
        }
    } catch (error) {
        // Handle errors during the API call
        console.error('Error during API call:', error);
        const botMessage = this.createChatBotMessage('Có lỗi xảy ra khi kiểm tra đơn hàng của bạn.');
        this.updateChatbotState(botMessage);
    }
}


  async handleSearch(message) {
    try {
      // Gửi yêu cầu POST sử dụng axios
      const response = await axios.post('http://127.0.0.1:8080/manager/transport/pull', {
        content: message,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      // Kiểm tra phản hồi từ API
      if (response.data && response.data.body && response.data.body.length > 0) {
        const botMessages = response.data.body.map((item) => {
          const { index } = item;

          // Xử lý theo từng loại index
          let botMessageText = '';
          switch (index) {
            case 1:
              botMessageText = `Sách "${item.name_book}" có giá ${item.price} VND.`;
              break;
            case 2:
              botMessageText = `Số lượng sách "${item.name_book}" là ${item.quality}.`;
              break;
            case 3:
              botMessageText = `Tác giả: ${item.author}, Quốc tịch: ${item.nationality}, Ngày sinh: ${item.birth_date}.`;
              break;
            case 4:
              botMessageText = `Đơn hàng cho sách "${item.name_book}", số lượng ${item.quantity}, sẽ được gửi tới địa chỉ: ${item.address}. Email liên hệ: ${item.email}, SĐT: ${item.phone_number}.`;
              break;
            case 5:
              const typeBooks = item.type_books.map((type) => type.name).join(', ');
              botMessageText = `Một số sách  bạn có thể tìm thấy: ${typeBooks}`;
              break;
            default:
              botMessageText = 'Không tìm thấy thông tin phù hợp.';
          }

          return this.createChatBotMessage(botMessageText);
        });

        // Cập nhật chatbot với từng thông điệp
        botMessages.forEach((botMessage) => this.updateChatbotState(botMessage));
      } else {
        // Không có thông tin hợp lệ trong phản hồi
        const botMessage = this.createChatBotMessage('Không thể tìm thấy thông tin.');
        this.updateChatbotState(botMessage);
      }
    } catch (error) {
      // Xử lý lỗi khi gọi API
      console.error('Error during API call:', error);
      const botMessage = this.createChatBotMessage('Có lỗi xảy ra khi xử lý yêu cầu của bạn.');
      this.updateChatbotState(botMessage);
    }
  }

  giolamViec() {
    // Define the working hours message
    const workingHoursMessage = `Giờ làm việc của chúng tôi như sau:\n- Thứ Hai đến Thứ Sáu: 8:00 - 17:00\n- Thứ Bảy: 9:00 - 12:00\n- Chủ Nhật: Nghỉ`;

    // Create and update the chatbot state with the working hours message
    const botMessage = this.createChatBotMessage(workingHoursMessage);
    this.updateChatbotState(botMessage);
  }


  updateChatbotState(message) {
    this.setState((prevState) => ({
      ...prevState,
      messages: [...prevState.messages, message],
    }));
  }
}

export default ActionProvider;
