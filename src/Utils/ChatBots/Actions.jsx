import { message } from 'antd';
import axios from 'axios';

class ActionProvider {
  constructor(createChatBotMessage, setStateFunc) {
    this.createChatBotMessage = createChatBotMessage;
    this.setState = setStateFunc;
  }

  handleDefault() {
    const botMessage = this.createChatBotMessage(
      'xin lỗi , tôi ko hiểu câu hỏi cảu bạn xin vui lòng nhập lại'
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
  handleDonHangHomQua() {
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
          const statusFilter = [11, 13, 17, 19, 21];
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
          botMessages.forEach(botMessage => this.updateChatbotState(botMessage));
        } else {
          const botMessage = this.createChatBotMessage('Không tìm thấy đơn hàng phù hợp với trạng thái.');
          this.updateChatbotState(botMessage);
        }
      } else {
        const botMessage = this.createChatBotMessage('Không tìm thấy đơn hàng của bạn.');
        this.updateChatbotState(botMessage);
      }
    } catch (error) {
      console.error('Error during API call:', error);
      const botMessage = this.createChatBotMessage('Có lỗi xảy ra khi kiểm tra đơn hàng của bạn.');
      this.updateChatbotState(botMessage);
    }
  }

  async handleSearch(message) {
    try {
      const response = await axios.post('http://127.0.0.1:8080/manager/transport/pull', {
        content: message,
      }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data && response.data.body && response.data.body.length > 0) {
        const botMessages = response.data.body.map((item) => {
          const { index } = item;

          let botMessageText = '';
          switch (index) {
            case 1:
              localStorage.setItem('statusBuyUseChatBot', 1)
              botMessageText = `Sách "${item.name_book}" có giá ${item.price} VND.`;
              break;
            case 2:
              localStorage.setItem('statusBuyUseChatBot', 2)
              botMessageText = `Số lượng sách "${item.name_book}" là ${item.quality}.`;
              break;
            case 3:
              localStorage.setItem('statusBuyUseChatBot', 3)
              botMessageText = `Tác giả: ${item.author}, Quốc tịch: ${item.nationality}, Ngày sinh: ${item.birth_date}.`;
              break;
            case 4:
              const orderDetails = {
                name_book: item.name_book,
                quantity: item.quantity,
                address: item.address,
                email: item.email,
                phone_number: item.phone_number
              };
              localStorage.setItem('statusBuyUseChatBot', 4)
              localStorage.setItem('listBookBuyWhenChatBot', JSON.stringify(orderDetails));
              botMessageText = 'Bạn muốn thanh toán online hay offline?';
              break;
            case 41:
              localStorage.setItem('statusBuyUseChatBot', 41)
              botMessageText = 'Cuốn sách đã hết hàng';
              break;
            case 5:
              localStorage.setItem('statusBuyUseChatBot', 5)
              const typeBooks = item.type_books.map((type) => type.name).join(', ');
              botMessageText = `Một số sách  bạn có thể tìm thấy: ${typeBooks}`;
              break;
            default:
              localStorage.setItem('statusBuyUseChatBot', 9999)
              botMessageText = 'Không tìm thấy thông tin phù hợp.';
          }

          return this.createChatBotMessage(botMessageText);
        });

        botMessages.forEach((botMessage) => this.updateChatbotState(botMessage));
      } else {
        const botMessage = this.createChatBotMessage('Không thể tìm thấy thông tin.');
        this.updateChatbotState(botMessage);
      }
    } catch (error) {
      console.error('Error during API call:', error);
      const botMessage = this.createChatBotMessage('Có lỗi xảy ra khi xử lý yêu cầu của bạn.');
      this.updateChatbotState(botMessage);
    }
  }

  async handleOnlinePayment() {
    message.success('Tôi sẽ điều hướng đến trang thanh toán ngay vui lòng chờ')
    const orderData = localStorage.getItem('listBookBuyWhenChatBot');
    const orderDetails = JSON.parse(orderData);
    const addressId = localStorage.getItem('delivery_address' || 0);
    let data = JSON.stringify({
      "name_book": orderDetails.name_book,
      "quantity": orderDetails.quantity,
      "address": orderDetails.address,
      "email": orderDetails.email,
      "phone_number": orderDetails.phone_number,
      "addres_id": addressId
    });
    try {
      const response = await axios.post('http://127.0.0.1:8080/manager/payment/create/payment/bot', data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.data.code === 0) {
        window.location.href = response.data.body.checkoutUrl;
      } else {
        message.error('Lỗi kết nối internet');
      }
    } catch (error) {
      message.error('Lỗi kết nối internet');
    }
  }

  async handleOfflinePayment() {
    message.success('Đơn hàng của bạn tạo thành công')
    const orderData = localStorage.getItem('listBookBuyWhenChatBot');
    const orderDetails = JSON.parse(orderData);
    const addressId = localStorage.getItem('delivery_address' || 0);
    let data = JSON.stringify({
      "name_book": orderDetails.name_book,
      "quantity": orderDetails.quantity,
      "address": orderDetails.address,
      "email": orderDetails.email,
      "phone_number": orderDetails.phone_number,
      "addres_id": addressId
    });
    try {
      const response = await axios.post('127.0.0.1:8080/manager/order/api/create/order/use/bot', data, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (response.data.code === 0) {
        window.location.reload();
      } else {
        message.error('Lỗi kết nối internet');
      }
    } catch (error) {
      message.error('Lỗi kết nối internet');
    }
  }

  giolamViec() {
    const workingHoursMessage = `Giờ làm việc của chúng tôi như sau:\n- Thứ Hai đến Thứ Sáu: 8:00 - 17:00\n- Thứ Bảy: 9:00 - 12:00\n- Chủ Nhật: Nghỉ`;

    const botMessage = this.createChatBotMessage(workingHoursMessage);
    this.updateChatbotState(botMessage);
  }

  async sachBanChay() {
    try {
      const response = await axios.get('http://127.0.0.1:8080/manager/book/list/use/bot/banchay');

      if (response.data.code === 0) {
        const books = response.data.body;
        let botMessageContent = "Danh sách sách bán chạy:\n";

        books.forEach((book) => {
          botMessageContent += `- Tên sách: ${book.name_book}, Giá: ${book.price}, Tác giả: ${book.authort_book}\n`;
        });

        const botMessage = this.createChatBotMessage(botMessageContent);
        this.updateChatbotState(botMessage);
      } else {
        message.error('Lỗi kết nối, vui lòng thử lại');
      }
    } catch (error) {
      message.error('Lỗi kết nối, vui lòng thử lại');
    }
  }

  updateChatbotState(message) {
    this.setState((prevState) => ({
      ...prevState,
      messages: [...prevState.messages, message],
    }));
  }
}

export default ActionProvider;
