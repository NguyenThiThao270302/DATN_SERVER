import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Avatar, Table, Spin, Input, Button, Popconfirm, message } from 'antd';

const { Search } = Input;

function ListCustomer() {
    const [customers, setCustomers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [pagination, setPagination] = useState({
        current: 1,
        pageSize: 10,
    });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchData(pagination.current, pagination.pageSize);
    }, [pagination.current, pagination.pageSize]);

    const fetchData = (page, pageSize) => {
        setLoading(true);
        axios.get('http://127.0.0.1:8080/manager/user/list/use/admin')
            .then((response) => {
                if (response.data.code === 0) {
                    setCustomers(response.data.body);
                    setPagination({
                        ...pagination,
                        total: response.data.body.length,
                    });
                }
            })
            .catch((error) => {
                console.error('There was an error fetching the customer list:', error);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    const handleTableChange = (pagination) => {
        setPagination({
            ...pagination,
            current: pagination.current,
        });
    };

    const handleSearch = (value) => {
        setSearchTerm(value);
        setPagination({ ...pagination, current: 1 }); // Reset to first page on search
    };

    const handleEdit = (record) => {
        message.info(`Editing user ${record.username}`);
        // Implement your edit functionality here
    };

    const handleDelete = (id) => {
        axios.delete(`http://127.0.0.1:8080/manager/user/${id}`)
            .then(() => {
                message.success('User deleted successfully');
                fetchData(pagination.current, pagination.pageSize);
            })
            .catch((error) => {
                console.error('There was an error deleting the user:', error);
                message.error('Failed to delete user');
            });
    };

    const filteredCustomers = customers.filter(customer => {
        const { username, full_name, email } = customer;
        return (
            username.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (full_name && full_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (email && email.toLowerCase().includes(searchTerm.toLowerCase()))
        );
    });

    const columns = [
        {
            title: 'Ảnh đại diện',
            dataIndex: 'avatar',
            key: 'avatar',
            render: avatar => <Avatar src={avatar} />,
        },
        {
            title: 'Tên đăng nhập',
            dataIndex: 'username',
            key: 'username',
        },
        {
            title: 'Họ và tên',
            dataIndex: 'full_name',
            key: 'full_name',
            render: (text, record) => record.full_name || record.username,
        },
        {
            title: 'Email',
            dataIndex: 'email',
            key: 'email',
        },
        {
            title: 'Số điện thoại',
            dataIndex: 'phone_number',
            key: 'phone_number',
        },
        {
            title: 'Hành động',
            key: 'action',
            render: (_, record) => (
                <span>
                    <Button type="primary" onClick={() => handleEdit(record)}>
                        Sửa
                    </Button>
                    <Popconfirm
                        title="Bạn có chắc muốn xóa người dùng này không?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="Có"
                        cancelText="Không"
                    >
                        <Button type="link" >
                            Xóa
                        </Button>
                    </Popconfirm>
                </span>
            ),
        },
    ];

    if (loading) {
        return <Spin size="large" />;
    }

    return (
        <div>
            <h1>Quản lý khách hàng</h1>
            <Search
                placeholder="Tìm kiếm theo Tên đăng nhập, Họ và tên, Email"
                allowClear
                enterButton="Tìm kiếm"
                size="large"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                style={{ marginBottom: 16 }}
            />
            <Table
                columns={columns}
                dataSource={filteredCustomers}
                pagination={{
                    ...pagination,
                    total: filteredCustomers.length, // Update pagination total based on filtered results
                }}
                loading={loading}
                rowKey="id"
                onChange={handleTableChange}
            />
        </div>
    );
}

export default ListCustomer;
