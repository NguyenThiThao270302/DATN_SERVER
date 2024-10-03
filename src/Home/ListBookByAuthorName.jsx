import { useEffect, useState } from "react";
import styles from './ListBookByAuthorName.module.css';
import CardProduct from "./CardProduct";

function ListBookByAuthorName() {
    const [books, setBooks] = useState([]);
    const [isLoading, setIsLoading] = useState(true);  // For showing loading state
    const [noBooksFound, setNoBooksFound] = useState(false); // For showing no books found message

    const handleGetListBookByAuthorName = async () => {
        try {
            // Simulate a 3-second delay
            await new Promise(resolve => setTimeout(resolve, 1000));

            const author = localStorage.getItem('authorName');
            if (!author) {
                console.error('No author found in localStorage');
                setNoBooksFound(true);
                return;
            }
            
            const response = await fetch(`http://127.0.0.1:8080/manager/book/list/by/author?name=${encodeURIComponent(author)}`);
            const data = await response.json();

            if (data.code === 0 && data.body) {
                if (data.body.books.length > 0) {
                    setBooks(data.body.books);
                    setNoBooksFound(false);
                } else {
                    setNoBooksFound(true); // If books array is empty
                }
            } else {
                setNoBooksFound(true); // Handle cases where response code is not 0
            }
        } catch (error) {
            console.error('Error fetching books:', error);
            setNoBooksFound(true); // Set noBooksFound in case of error
        } finally {
            setIsLoading(false);  // Stop loading after the fetch completes
        }
    };

    useEffect(() => {
        handleGetListBookByAuthorName();
    }, []); // Empty dependency array ensures this runs only once on mount

    return (
        <div>
            {isLoading ? (
                <p>...</p>
            ) : (
                <div>
                    {noBooksFound ? (
                        <p>No books found for this author.</p>
                    ) : (
                        <div className={styles['books-container']}>
                            {books.map((item) => (
                                <div key={item.id} className={styles['book-card']}>
                                    <CardProduct
                                        bookId={item.id}
                                        author_name={item.author_name}
                                        discount_price={item.discount_price}
                                        file_desc_first={item.file_desc_first}
                                        price={item.price}
                                        publisher={item.publisher}
                                        title={item.title}
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default ListBookByAuthorName;
