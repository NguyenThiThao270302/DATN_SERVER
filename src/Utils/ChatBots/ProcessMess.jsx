class MessageParser {
    constructor(actionProvider) {
        this.actionProvider = actionProvider;
    }

    parse(message) {
        const lowerCaseMessage = message.toLowerCase();

        if (lowerCaseMessage.includes('xin chào') ||
            lowerCaseMessage.includes('hi') ||
            lowerCaseMessage.includes('chào')
        ) {
            this.actionProvider.handleDefault();
        } else if (
            lowerCaseMessage.includes('đơn hàng nào đang giao') ||
            lowerCaseMessage.includes('đơn hàng của tôi')
        ) {
            this.actionProvider.handleCheckOrder();  // Gọi hàm kiểm tra đơn hàng đang giao
        } else if (
            lowerCaseMessage.includes('giờ làm việc của cửa hàng')
        ) {
            this.actionProvider.giolamViec()
        } else if (
            lowerCaseMessage.includes('có thanh toán online không')
        ) {
            this.actionProvider.handleHelpPaymenty()
        } else if (
            lowerCaseMessage.includes('cửa hàng giao hàng toàn quốc không')
        ) {
            this.actionProvider.handleGiaoHang()
        } else if (
            lowerCaseMessage.includes('đơn hàng hôm qua')
        ) {
        } else if (
            lowerCaseMessage.includes('thanh toán online') && localStorage.getItem('statusBuyUseChatBot')
        ) {
            this.actionProvider.handleOnlinePayment();
        } else if (
            lowerCaseMessage.includes('thanh toán offline') && localStorage.getItem('statusBuyUseChatBot')
        ) {
            this.actionProvider.handleOfflinePayment();
        } else if (
            lowerCaseMessage.includes('sách bán chạy')
        ) {
            this.actionProvider.sachBanChay();
        } else {
            this.actionProvider.handleSearch(message);  // Pass the original message
        }
    }
}

export default MessageParser;
