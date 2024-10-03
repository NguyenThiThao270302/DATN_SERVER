import axios from "axios";
import { useEffect, useState } from "react";
import styleCart from './list_book_home.module.css';
import CardProduct from "./CardProduct";
import { Button, Input, Space } from "antd";

function ManLayRaListSachTheoLoai() {
    const [books, setBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [inputPriceFrom, setInputPriceFrom] = useState(null);
    const [inputPriceTo, setInputPriceTo] = useState(null);
    const [priceFrom, setPriceFrom] = useState(null);
    const [priceTo, setPriceTo] = useState(null);
    const [sortBy, setSortBy] = useState(null);
    const [backHome, setbackHome] = useState(false);
    const [nameTypeBook, setNameTypeBook] = useState(null);

    const fetchListBookByTypeBook = async () => {
        try {
            const response = await axios.get(
                `http://127.0.0.1:8080/manager/book/list/type_book?name=${nameTypeBook}`
            );
            const data = response.data;

            if (data.code === 0) {
                setBooks(data.body.book_detail_list || []); // Đảm bảo mảng không bị null
                setFilteredBooks(data.body.book_detail_list || []); // Đảm bảo mảng không bị null
            } else {
                console.error("Error fetching books:", data.message);
            }
        } catch (error) {
            console.error("Failed to fetch books:", error);
        }
    };

    useEffect(() => {
        const timeoutId = setTimeout(() => {
            const typeBookFromLocalStorage = localStorage.getItem('typebook');
            setNameTypeBook(typeBookFromLocalStorage);
        }, 100); // Đặt delay 0.1s

        return () => clearTimeout(timeoutId);
    }, []);

    useEffect(() => {
        if (nameTypeBook) {
            fetchListBookByTypeBook();
        }
    }, [nameTypeBook]);

    const applyFilters = () => {
        let updatedBooks = [...books];

        if (priceFrom !== null && priceTo !== null) {
            updatedBooks = updatedBooks.filter(book =>
                book.book.price >= priceFrom && book.book.price <= priceTo
            );
        }

        setFilteredBooks(updatedBooks);
    };

    const applySorting = (booksToSort) => {
        let sortedBooks = [...booksToSort];

        if (sortBy === "asc") {
            sortedBooks.sort((a, b) => a.book.price - b.book.price);
        } else if (sortBy === "desc") {
            sortedBooks.sort((a, b) => b.book.price - a.book.price);
        }

        return sortedBooks;
    };

    const handleSort = (order) => {
        setSortBy(order);

        if (order === null) {
            setFilteredBooks([...books]);
        } else {
            const sortedBooks = applySorting(filteredBooks);
            setFilteredBooks(sortedBooks);
        }
    };

    const handlePriceFromChange = (e) => {
        setInputPriceFrom(Number(e.target.value));
    };

    const handlePriceToChange = (e) => {
        setInputPriceTo(Number(e.target.value));
    };

    const handleSearchClick = () => {
        setPriceFrom(inputPriceFrom);
        setPriceTo(inputPriceTo);
        applyFilters();
    };

    useEffect(() => {
        setFilteredBooks(applySorting(filteredBooks));
    }, [sortBy]);

    if (!filteredBooks || filteredBooks.length === 0) {
        return <div style={{marginTop:'50px'}}>
            <Button onClick={() => setbackHome(true)}>Quay lại</Button>
            Chưa có sách nào
        </div>;
    }

    if (backHome) {
        window.location.reload();
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
                <Space>
                    <Button onClick={() => handleSort('desc')} style={{ height: '42px' }}>Giá từ cao đến thấp</Button>
                    <Button onClick={() => handleSort('asc')} style={{ height: '42px' }}>Giá từ thấp đến cao</Button>
                    <Button onClick={() => handleSort(null)} style={{ height: '42px' }}>Mặc định</Button>
                    <Input placeholder="Giá từ" onChange={handlePriceFromChange} />
                    <Input placeholder="Đến khoảng" onChange={handlePriceToChange} />
                    <Button style={{ height: '42px' }} onClick={handleSearchClick}>Tìm kiếm</Button>
                </Space>
            </div>

            <div className={styleCart['books-container']}>
                {filteredBooks.map((item) => (
                    <div key={item.book.id} className={styleCart['book-card']}>
                        <CardProduct
                            bookId={item.book.id}
                            author_name={item.book.author_name}
                            discount_price={item.book.discount_price}
                            file_desc_first={item.files[0]}
                            price={item.book.price}
                            publisher={item.book.publisher}
                            title={item.book.title}
                            typeBook={nameTypeBook}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default ManLayRaListSachTheoLoai;
