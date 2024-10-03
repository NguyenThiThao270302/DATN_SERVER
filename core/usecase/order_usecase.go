package usecase

import (
	"context"
	"encoding/json"
	"fmt"
	"shoe_shop_server/common/enums"
	errors "shoe_shop_server/common/error"
	"shoe_shop_server/common/log"
	"shoe_shop_server/common/utils"
	"shoe_shop_server/core/domain"
	"shoe_shop_server/core/entities"
	"strconv"
	"time"
)

type UseCaseOrder struct {
	order     domain.RepositoryOrder
	book      domain.RepositoryBook
	trans     domain.RepositoryTransaction
	orderItem domain.RepositoryOrderItem
	address   domain.RepositoryDeliveryAddress
	user      domain.RepositoryUser
}

func NewUseCaseOrder(order domain.RepositoryOrder,
	book domain.RepositoryBook,
	orderItem domain.RepositoryOrderItem,
	address domain.RepositoryDeliveryAddress,
	user domain.RepositoryUser,
	trans domain.RepositoryTransaction) *UseCaseOrder {
	return &UseCaseOrder{
		order:     order,
		book:      book,
		trans:     trans,
		orderItem: orderItem,
		address:   address,
		user:      user,
	}
}

func (u *UseCaseOrder) GetOrderById(ctx context.Context, id string) (*domain.Order, errors.Error) {
	idNumber, _ := strconv.ParseInt(id, 10, 64)
	resp, err := u.order.GetOrderByID(ctx, idNumber)
	if err != nil {
		return nil, errors.NewSystemError("error system")
	}
	return resp, nil
}

func (u *UseCaseOrder) UpdateStatusOrder(ctx context.Context, orderId string) errors.Error {
	numberOrderId, _ := strconv.ParseInt(orderId, 10, 64)

	err := u.order.UpdateStatusOrderSucsess(ctx, numberOrderId)
	if err != nil {
		log.Error(err, "error server")
		return errors.NewSystemError(fmt.Sprintf("error system . %v", err))
	}
	return nil
}

func (u *UseCaseOrder) ListOrder(ctx context.Context, req *domain.OrderForm) ([]*domain.Order, errors.Error) {
	var orders []*domain.Order

	listOrder, err := u.order.ListOrders(ctx, req)
	if err != nil {
		return nil, errors.ErrSystem
	}
	for _, v := range listOrder {
		if v.Status != 7 {
			orders = append(orders, v)
		}
	}
	return orders, nil
}

func (u *UseCaseOrder) UpdateOrderForSend(ctx context.Context, id string, status string) errors.Error {
	idNumber, _ := strconv.ParseInt(id, 10, 64)
	statusNumber, _ := strconv.ParseInt(status, 10, 64)
	err := u.order.UpdateOrderForSend(ctx, idNumber, int(statusNumber))
	if err != nil {
		log.Error(err, "error")
		return errors.NewSystemError(fmt.Sprintf("error system . %v", err))
	}
	return nil
}

func (u *UseCaseOrder) ListOrdersUseTk(ctx context.Context, start, end string) ([]*domain.Order, errors.Error) {
	startN, _ := strconv.ParseInt(start, 10, 64)
	endN, _ := strconv.ParseInt(end, 10, 64)
	listOrder, err := u.order.ListOrdersUseTk(ctx, &domain.OrderFormUseTk{
		StartTime: startN,
		EndTime:   endN,
	})
	if err != nil {
		return nil, errors.ErrSystem
	}
	return listOrder, nil
}

func (u *UseCaseOrder) UpdateOrderOffline(ctx context.Context, orderId string) errors.Error {

	idNumber, _ := strconv.ParseInt(orderId, 10, 64)
	err := u.order.UpdateStatusPaymentOffline(ctx, idNumber, enums.AWAITING_CONFIRMATION)
	if err != nil {
		return errors.NewSystemError(fmt.Sprintf("error system . %v", err))
	}
	return nil
}

func (u *UseCaseOrder) UpdateOrderCanCel(ctx context.Context, orderId string) errors.Error {

	idNumber, _ := strconv.ParseInt(orderId, 10, 64)
	err := u.order.UpdateOrder(ctx, &domain.Order{
		ID:     idNumber,
		Status: enums.CANCELLED,
	})
	if err != nil {
		log.Error(err, "error")
		return errors.NewSystemError(fmt.Sprintf("error system . %v", err))
	}
	listOrderId, err := u.orderItem.GetOrderByOrderId(ctx, idNumber)
	if err != nil {
		log.Error(err, "error")
		return errors.NewSystemError(fmt.Sprintf("error system . %v", err))
	}
	for _, v := range listOrderId {
		book, err := u.book.GetBookById(ctx, v.BookID)
		if err != nil {
			log.Error(err, "error")
			return errors.NewSystemError(fmt.Sprintf("error system . %v", err))
		}
		if book != nil {
			err = u.book.UpdateQuantity(ctx, v.BookID, book.Quantity+v.Quantity)
			if err != nil {
				log.Error(err, "error")
				return errors.NewSystemError(fmt.Sprintf("error system . %v", err))
			}
		}
	}

	return nil
}

func (u *UseCaseOrder) CreateOrderWhenBuyCart(ctx context.Context, req *entities.OrderRequestSubmitBuyFromCart) (int64, float64, errors.Error) {
	var orderItems []*entities.Items
	var count int
	var priceToal float64
	orderId := utils.GenerateUniqueKey()
	addressIdNum, _ := strconv.ParseInt(req.AddresId, 10, 64)
	err := json.Unmarshal([]byte(req.Items), &orderItems)
	if err != nil {
		log.Error(err, "Error unmarshalling JSON: %v")
		return 0, 0, errors.ErrSystem
	}

	orderDate := time.Now()
	orderDateString := orderDate.Format("2006-01-02 15:04:05")
	for _, v := range orderItems {
		count += v.Quantity
		book, _ := u.book.GetBookById(ctx, v.BookID)
		u.book.UpdateQuantity(ctx, v.BookID, book.Quantity-v.Quantity)
		u.orderItem.CreateOrderItem(ctx, &domain.OrderItem{
			ID:       utils.GenerateUniqueKey(),
			OrderID:  orderId,
			BookID:   v.BookID,
			Quantity: v.Quantity,
			Price:    v.Price,
		})
	}
	err = u.order.CreateOrder(ctx, &domain.Order{
		ID:           orderId,
		CustomerName: req.CustomerName,
		OrderDate:    orderDateString,
		Quantity:     count,
		TotalAmount:  float64(orderItems[0].TotalAmount),
		Status:       enums.AWAITING_CONFIRMATION,
		TypePayment:  enums.TYPE_PAYMENT_ONLINE,
		CreateTime:   time.Now(),
		CreateOrder:  utils.GenerateTimestamp(),
		AddressId:    addressIdNum,

		Items: req.Items,
	})
	if err != nil {
		log.Error(err, "Error unmarshalling JSON: %v")
		return 0, 0, errors.ErrSystem
	}
	log.Infof("data ", priceToal)
	return orderId, float64(orderItems[0].TotalAmount), nil
}

func (u *UseCaseOrder) CreateOrderWhenBuyOffLine(ctx context.Context, req *entities.OrderRequestSubmitBuyFromCart) errors.Error {
	addressIdNum, _ := strconv.ParseInt(req.AddresId, 10, 64)

	var orderItems []*entities.Items
	var count int
	var priceToal float64
	orderId := utils.GenerateUniqueKey()

	err := json.Unmarshal([]byte(req.Items), &orderItems)
	if err != nil {
		log.Error(err, "Error unmarshalling JSON: %v")
		return errors.ErrSystem
	}

	orderDate := time.Now()
	orderDateString := orderDate.Format("2006-01-02 15:04:05")
	for _, v := range orderItems {
		count += v.Quantity
		book, _ := u.book.GetBookById(ctx, v.BookID)
		u.book.UpdateQuantity(ctx, v.BookID, book.Quantity-v.Quantity)
		u.orderItem.CreateOrderItem(ctx, &domain.OrderItem{
			ID:       utils.GenerateUniqueKey(),
			OrderID:  orderId,
			BookID:   v.BookID,
			Quantity: v.Quantity,
			Price:    v.Price,
		})
	}
	err = u.order.CreateOrder(ctx, &domain.Order{
		ID:           orderId,
		CustomerName: req.CustomerName,
		OrderDate:    orderDateString,
		Quantity:     count,
		TotalAmount:  float64(orderItems[0].TotalAmount),
		Status:       enums.AWAITING_CONFIRMATION,
		TypePayment:  enums.TYPE_PAYMENT_OFFLINE,
		CreateTime:   time.Now(),
		CreateOrder:  utils.GenerateTimestamp(),
		AddressId:    addressIdNum,

		Items: req.Items,
	})
	if err != nil {
		log.Error(err, "Error system: %v")
		return errors.ErrSystem
	}
	log.Infof("data ", priceToal)
	return nil
}

func (u *UseCaseOrder) GetListOrderByUserProFile(ctx context.Context, name string) ([]*entities.OrderDetailsInterNal, error) {

	now := time.Now()
	estimatedDate := now.Add(3 * 24 * time.Hour)
	var listItemOrder = make([]entities.Item, 0)
	var detailListorder = make([]*entities.OrderDetailsInterNal, 0)
	listOrder, err := u.order.GetListorderByUser(ctx, name)
	if err != nil {
		log.Error(err, "Error unmarshalling JSON: %v")
		return nil, errors.ErrSystem
	}
	for _, v := range listOrder {

		orderItem, err := u.orderItem.GetOrderByOrderId(ctx, v.ID)
		if err != nil {
			log.Error(err, "Error system: %v")
			return nil, errors.ErrSystem
		}
		getaddress, err := u.address.GetAddressByUserName(ctx, name)
		if err != nil {
			log.Error(err, "Error system: %v")
			return nil, errors.ErrSystem
		}
		for _, v := range orderItem {
			book, _ := u.book.GetBookByIUseOrder(ctx, v.BookID)
			if book != nil {
				listItemOrder = append(listItemOrder, entities.Item{
					Name:     book.Title,
					Quantity: v.Quantity,
					Price:    v.Price,
				})
			}
		}

		if orderItem != nil {
			detailListorder = append(detailListorder, &entities.OrderDetailsInterNal{
				OrderID:    v.ID,
				CreateTime: v.CreateTime,
				Address: &domain.DeliveryAddress{
					ID:          getaddress.ID,
					OrderID:     getaddress.OrderID,
					Email:       getaddress.Email,
					UserName:    name,
					PhoneNumber: getaddress.PhoneNumber,
					Province:    getaddress.PhoneNumber,
					District:    getaddress.District,
					Commune:     getaddress.Commune,
					Detailed:    getaddress.Detailed,
					NickName:    getaddress.NickName,
				},
				Amount:        v.TotalAmount,
				EstimatedDate: estimatedDate,
				Items:         listItemOrder,
				Status:        v.Status,
				PaymentType:   v.TypePayment,
			})
		}

	}

	return detailListorder, nil
}

func (u *UseCaseOrder) GetListOrderAdmin(ctx context.Context) ([]*entities.OrderDetailsAdmin, error) {
	var dataResp = make([]*entities.OrderDetailsAdmin, 0)
	orders, err := u.order.ListOrdersUseAdmin(ctx)
	if err != nil {
		log.Error(err, "error system: %v")
		return nil, errors.ErrSystem
	}

	for _, order := range orders {
		if order.Status != enums.CANCELLED {
			dataResp = append(dataResp, &entities.OrderDetailsAdmin{
				OrderId:     order.ID,
				TimeUserBuy: order.CreateTime.Format("02/01/2006"),
				Amount:      order.TotalAmount,
				Status:      order.Status,
				Quantity:    order.Quantity,
			})
		}
	}

	return dataResp, nil
}

func (u *UseCaseOrder) GetListOrderByThongkeHeader(ctx context.Context) (*entities.ListOrderDetailsAdminForHeader, error) {
	return nil, nil
}

func (u *UseCaseOrder) ExportBill(ctx context.Context, id string) (*entities.Bill, errors.Error) {
	now := time.Now()
	estimatedDate := now.Add(3 * 24 * time.Hour)
	orderIdNumerBer, _ := strconv.ParseInt(id, 10, 64)
	var items = make([]entities.Item, 0)
	order, err := u.order.GetOrderByID(ctx, orderIdNumerBer)
	if err != nil {
		log.Error(err, "error system")
		return nil, errors.ErrSystem
	}
	listItem, err := u.orderItem.GetOrderByOrderId(ctx, order.ID)
	if err != nil {
		log.Error(err, "error system")
		return nil, errors.ErrSystem
	}
	for _, v := range listItem {
		book, err := u.book.GetBookById(ctx, v.BookID)
		if err != nil {
			log.Error(err, "error system")
			return nil, errors.ErrSystem
		}
		if book != nil {
			items = append(items, entities.Item{
				Name:     book.Title,
				Quantity: v.Quantity,
				Price:    v.Price,
			})
		}

	}
	return &entities.Bill{
		OrderId:    orderIdNumerBer,
		Code:       "",
		Amount:     order.TotalAmount,
		Items:      items,
		Address:    &domain.DeliveryAddress{},
		CreateTime: estimatedDate,
	}, nil
}

// online
func (u *UseCaseOrder) CreateOrderUseBot(ctx context.Context, req *entities.OrderDetailsUseBot) (int64, float64, error) {
	orderId := utils.GenerateUniqueKey()
	var amount float64
	book, err := u.book.GetBookByUserNameBook(ctx, req.NameBook)
	if err != nil {
		log.Error(err, "error")
		return 0, 0, errors.NewSystemError("error system")
	}
	if book == nil {
		log.Error(err, "error")
		return 0, 0, errors.NewSystemError("error system")
	}
	orderDate := time.Now()
	orderDateString := orderDate.Format("2006-01-02 15:04:05")

	amount = book.Price * float64(req.Quantity)
	err = u.order.CreateOrder(ctx, &domain.Order{
		ID:           orderId,
		CustomerName: req.UserName,
		OrderDate:    orderDateString,
		Quantity:     req.Quantity,
		TotalAmount:  amount,
		Status:       enums.AWAITING_CONFIRMATION,
		TypePayment:  enums.TYPE_PAYMENT_ONLINE,
		CreateTime:   time.Now(),
		CreateOrder:  utils.GenerateTimestamp(),
		AddressId:    req.AddresId,
	})
	if err != nil {
		log.Error(err, "error")
		return 0, 0, errors.NewSystemError("error system")
	}
	err = u.orderItem.CreateOrderItem(ctx, &domain.OrderItem{
		ID:       orderId,
		OrderID:  utils.GenerateUniqueKey(),
		BookID:   book.ID,
		Quantity: req.Quantity,
		Price:    amount,
	})
	if err != nil {
		log.Error(err, "error")
		return 0, 0, errors.NewSystemError("error system")
	}
	return orderId, amount, nil
}

// offline
func (u *UseCaseOrder) CreateOrderOffLineUseBot(ctx context.Context, req *entities.OrderDetailsUseBot) (int64, float64, error) {
	orderId := utils.GenerateUniqueKey()
	var amount float64
	book, err := u.book.GetBookByUserNameBook(ctx, req.NameBook)
	if err != nil {
		log.Error(err, "error")
		return 0, 0, errors.NewSystemError("error system")
	}
	if book == nil {
		log.Error(err, "error")
		return 0, 0, errors.NewSystemError("error system")
	}
	orderDate := time.Now()
	orderDateString := orderDate.Format("2006-01-02 15:04:05")

	amount = book.Price * float64(req.Quantity)
	err = u.order.CreateOrder(ctx, &domain.Order{
		ID:           orderId,
		CustomerName: req.UserName,
		OrderDate:    orderDateString,
		Quantity:     req.Quantity,
		TotalAmount:  amount,
		Status:       enums.AWAITING_CONFIRMATION,
		TypePayment:  enums.TYPE_PAYMENT_ONLINE,
		CreateTime:   time.Now(),
		CreateOrder:  utils.GenerateTimestamp(),
		AddressId:    req.AddresId,
	})
	if err != nil {
		log.Error(err, "error")
		return 0, 0, errors.NewSystemError("error system")
	}
	err = u.orderItem.CreateOrderItem(ctx, &domain.OrderItem{
		ID:       orderId,
		OrderID:  utils.GenerateUniqueKey(),
		BookID:   book.ID,
		Quantity: req.Quantity,
		Price:    amount,
	})
	if err != nil {
		log.Error(err, "error")
		return 0, 0, errors.NewSystemError("error system")
	}
	return orderId, amount, nil
}

func (u *UseCaseOrder) TongTinChoThongKePhanHeader(ctx context.Context) (*entities.ThongKePhanHeeader, error) {
	var dataResp = make([]*entities.OrderDetailsAdmin, 0)
	var userResp = make([]*entities.UserRespGetList, 0)
	orders, err := u.order.ListOrdersUseAdmin(ctx)
	if err != nil {
		log.Error(err, "error system: %v")
		return nil, errors.ErrSystem
	}

	for _, order := range orders {
		if order.Status != enums.CANCELLED {
			dataResp = append(dataResp, &entities.OrderDetailsAdmin{
				OrderId:     order.ID,
				TimeUserBuy: order.CreateTime.Format("02/01/2006"),
				Amount:      order.TotalAmount,
				Status:      order.Status,
				Quantity:    order.Quantity,
			})
		}
	}
	users, err := u.user.FindAccount(ctx, &domain.UserReqByForm{})
	if err != nil {
		log.Error(err, "error system: %v")
		return nil, errors.ErrSystem
	}
	for _, v := range users {
		timeString := utils.ConvertTimestampToDateTime(int64(v.CreateTime))
		userResp = append(userResp, &entities.UserRespGetList{
			ID: v.ID,

			CreateTime: timeString,
		})
	}

	return &entities.ThongKePhanHeeader{
		User:              userResp,
		OrderDetailsAdmin: dataResp,
	}, nil
}
