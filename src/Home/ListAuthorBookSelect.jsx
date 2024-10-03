import React, { useState, useEffect } from 'react';
import { Button, Spin, Dropdown, Menu, message } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';
import axios from 'axios';

function ListAuthorBookButton({ onAuthorNameChange, onEventClick }) {
    const [authors, setAuthors] = useState([]); // Correct variable name
    const [loading, setLoading] = useState(false);
    const [selectedAuthor, setSelectedAuthor] = useState(null); // Correct variable name

    // Function to fetch authors from the API
    const fetchAuthors = async () => {
        setLoading(true);
        try {
            const response = await axios.get('http://127.0.0.1:8080/manager/author_book/list');
            if (response.data.code === 0) {
                setAuthors(response.data.body);
            } else {
                message.error('Failed to load authors.');
            }
        } catch (error) {
            console.error('Error fetching authors:', error);
            message.error('Error fetching authors.');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAuthors();
    }, []);

    // Handle menu item click
    const handleMenuClick = (e) => {
        const selected = authors.find(author => author.id === parseInt(e.key, 10));
        if (selected) {
            setSelectedAuthor(selected);
            onAuthorNameChange(selected.name);
            localStorage.setItem('authorName',selected.name)
            if (onEventClick) onEventClick();
        }
    };

    // Create the dropdown menu
    const menu = (
        <Menu onClick={handleMenuClick}>
            {loading ? (
                <Menu.Item disabled>
                    <Spin indicator={<LoadingOutlined style={{ fontSize: 16 }} spin />} />
                </Menu.Item>
            ) : (
                authors.map((author) => (
                    <Menu.Item key={author.id}>
                        {author.name}
                    </Menu.Item>
                ))
            )}
        </Menu>
    );

    return (
        <div>
            <Dropdown overlay={menu} trigger={['click']} disabled={loading}>
                <Button
                    style={{
                        border: 'none',
                        background: 'none',
                        boxShadow: 'none',
                        padding: 0,
                        color: 'black',
                        cursor: 'pointer',
                        fontSize: '17px'
                    }}
                >
                    {selectedAuthor ? selectedAuthor.name : 'Tác giả'}
                </Button>
            </Dropdown>
            {selectedAuthor && (
                <Button
                    style={{
                        marginLeft: 10,
                        border: 'none',
                        background: 'none',
                        padding: 0,
                        color: '#1890ff',
                        cursor: 'pointer'
                    }}
                    onClick={() => {
                        setSelectedAuthor(null);
                        onAuthorNameChange(null); // Notify parent that selection is cleared
                    }}
                >
                    Clear Selection
                </Button>
            )}
        </div>
    );
}

export default ListAuthorBookButton;
