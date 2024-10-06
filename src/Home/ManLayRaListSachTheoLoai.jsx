import axios from "axios";
import { useEffect, useState } from "react";
import styleCart from './list_book_home.module.css';
import CardProduct from "./CardProduct";
import { Button, Input, Space, Pagination } from "antd";
import { TiArrowBack } from "react-icons/ti";

function ManLayRaListSachTheoLoai({ checkLenListBook }) {
    const [books, setBooks] = useState([]);
    const [filteredBooks, setFilteredBooks] = useState([]);
    const [inputPriceFrom, setInputPriceFrom] = useState('');
    const [inputPriceTo, setInputPriceTo] = useState('');
    const [priceFrom, setPriceFrom] = useState(null);
    const [priceTo, setPriceTo] = useState(null);
    const [sortBy, setSortBy] = useState(null);
    const [nameTypeBook, setNameTypeBook] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 8; // Set fixed page size to 8

    const fetchListBookByTypeBook = async () => {
        try {
            const response = await axios.get(
                `http://127.0.0.1:8080/manager/book/list/type_book?name=${nameTypeBook}`
            );
            const data = response.data;

            if (data.code === 0) {
                setBooks(data.body.book_detail_list || []);
                setFilteredBooks(data.body.book_detail_list || []);
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
        }, 100);

        return () => clearTimeout(timeoutId);
    }, []);

    useEffect(() => {
        if (nameTypeBook) {
            fetchListBookByTypeBook();
        }
    }, [nameTypeBook]);

    useEffect(() => {
        checkLenListBook && checkLenListBook(filteredBooks.length);
    }, [filteredBooks, checkLenListBook]);

    const applyFilters = () => {
        let updatedBooks = [...books];

        if (priceFrom !== null && priceTo !== null) {
            updatedBooks = updatedBooks.filter(book =>
                book.book.price >= priceFrom && book.book.price <= priceTo
            );
        }

        setFilteredBooks(updatedBooks);
        setCurrentPage(1);
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
        setCurrentPage(1);
    };

    const handlePriceFromChange = (e) => {
        setInputPriceFrom(e.target.value);
    };

    const handlePriceToChange = (e) => {
        setInputPriceTo(e.target.value);
    };

    const handleSearchClick = () => {
        setPriceFrom(inputPriceFrom ? Number(inputPriceFrom) : null);
        setPriceTo(inputPriceTo ? Number(inputPriceTo) : null);
        applyFilters();
    };

    useEffect(() => {
        setFilteredBooks(applySorting(filteredBooks));
    }, [sortBy]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    if (!filteredBooks || filteredBooks.length === 0) {
        return (
            <div style={{ marginTop: '50px' }}>
                <div>
                    <TiArrowBack
                        style={{ fontSize: '25px', cursor: 'pointer' }}
                        onClick={() => { window.location.reload() }}
                    />
                </div>
                <div>Chưa có sách nào</div>
            </div>
        );
    }

    const paginatedBooks = filteredBooks.slice(
        (currentPage - 1) * pageSize,
        currentPage * pageSize
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '100px' }}>
                <Space>
                    <Button onClick={() => handleSort('desc')} style={{ height: '42px' }}>Giá từ cao đến thấp</Button>
                    <Button onClick={() => handleSort('asc')} style={{ height: '42px' }}>Giá từ thấp đến cao</Button>
                    <Button onClick={() => handleSort(null)} style={{ height: '42px' }}>Mặc định</Button>
                    <Input placeholder="Giá từ" onChange={handlePriceFromChange} value={inputPriceFrom} />
                    <Input placeholder="Đến khoảng" onChange={handlePriceToChange} value={inputPriceTo} />
                    <Button style={{ height: '42px' }} onClick={handleSearchClick}>Tìm kiếm</Button>
                </Space>
            </div>

            <div className={styleCart['books-container']}>
                {paginatedBooks.map((item) => (
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

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '20px', marginRight: '20px' }}>
                <Pagination
                    current={currentPage}
                    total={filteredBooks.length}
                    pageSize={pageSize}
                    onChange={handlePageChange}
                    
                />
            </div>
        </div>
    );
}

export default ManLayRaListSachTheoLoai;