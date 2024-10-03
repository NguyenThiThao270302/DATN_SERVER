import React, { useState } from 'react';
import { Breadcrumb, Layout, Menu, theme, Tabs, Button } from 'antd';
import { GiAbstract078 } from 'react-icons/gi';
import { GrUserAdmin } from 'react-icons/gr';
import { TbLogout2 } from 'react-icons/tb';

import InforMationUser from './InforMationUser';
import ListAddress from './ListAddress';
import ListOrderUser from './ListOrderUser';
import Favorite from './Favorite';
import styles from './profile.module.css'; // Import CSS module

const { Header, Content, Sider } = Layout;

const clearLocalStorageAndReload = () => {
    window.location.reload(); // Reload the page
};

const items1 = [
    {
        key: 'logout',
        icon: (
            <Button
                onClick={clearLocalStorageAndReload}
                style={{
                    backgroundColor: 'gray',
                }}
            >
                <TbLogout2 />
            </Button>
        ),
    },
    {
        key: 'abstract',
        icon: (
            <GiAbstract078
                style={{
                    justifyContent: 'center',
                    fontSize: '40px',
                }}
            />
        ),
    },
];

const tabsContent = [
    {
        key: '1',
        label: (
            <span className={styles.tabLabel}>
                 Thông tin cá nhân
            </span>
        ),
        content: <div><InforMationUser /></div>,
    },
    {
        key: '2',
        label: (
            <span className={styles.tabLabel}>
                Thông địa chỉ nhận hàng
            </span>
        ),
        content: <div style={{ marginLeft: '70px' }}><ListAddress /></div>,
    },
    {
        key: '3',
        label: (
            <span className={styles.tabLabel}>
                Đơn hàng của tôi
            </span>
        ),
        content: <div><ListOrderUser /></div>,
    },
    {
        key: '4',
        label: (
            <span style={{fontSize:'15px'}} className={`${styles.tabLabel} ${styles.favoriteLabel}`}>
                Sản phẩm yêu thích
            </span>
        ),
        content: <div><Favorite /></div>,
    },
];

const items2 = [
    {
        key: 'sub1',
        icon: <GrUserAdmin />,
        label: (
            <span style={{ fontSize: '18px' }}>
                Quản lý
            </span>
        ),
        children: tabsContent.map(tab => ({
            key: tab.key,
            label: tab.label,
            content: tab.content,
        })),
    },
];

function Dashboard() {
    const {
        token: { colorBgContainer, borderRadiusLG },
    } = theme.useToken();

    const [activeMenuItem, setActiveMenuItem] = useState('1');

    const handleMenuClick = ({ key }) => {
        setActiveMenuItem(key);
    };

    return (
        <div>
            <Layout>
                <Header
                    style={{
                        marginTop:'-60px',
                        display: 'flex',
                        alignItems: 'center',
                        background:
                            'linear-gradient(90deg, rgba(255, 189, 68, 1) 0%, rgba(240, 98, 146, 1) 35%, rgba(0, 122, 166, 1) 100%)',
                    }}
                >
                    <div className="demo-logo" />
                    <Menu
                        theme="dark"
                        mode="horizontal"
                        defaultSelectedKeys={['abstract']}
                        items={items1}
                        style={{
                            flex: 1,
                            alignItems: 'center',
                            background:
                                'linear-gradient(90deg, rgba(255, 189, 68, 1) 0%, rgba(240, 98, 146, 1) 35%, rgba(0, 122, 166, 1) 100%)',
                        }}
                    />
                </Header>
                <Layout>
                    <Sider
                        width={250}
                        style={{
                            background: colorBgContainer,
                        }}
                    >
                        <Menu
                            mode="inline"
                            defaultSelectedKeys={['sub1']}
                            defaultOpenKeys={['sub1']}
                            style={{
                                height: '100%',
                                borderRight: 0,
                            }}
                            items={items2}
                            onClick={handleMenuClick}
                        />
                    </Sider>
                    <Layout
                        style={{
                            padding: '0 24px 24px',
                        }}
                    >
                        <Breadcrumb
                            style={{
                                margin: '16px 0',
                            }}
                        />
                        <Content
                            style={{
                                padding: 24,
                                margin: 0,
                                minHeight: 280,
                                background: colorBgContainer,
                                borderRadius: borderRadiusLG,
                            }}
                        >
                            <Tabs
                                activeKey={activeMenuItem}
                                items={tabsContent.map(tab => ({
                                    key: tab.key,
                                    children: tab.content,
                                }))}
                            />
                        </Content>
                    </Layout>
                </Layout>
            </Layout>
        </div>
    );
}

export default Dashboard;
