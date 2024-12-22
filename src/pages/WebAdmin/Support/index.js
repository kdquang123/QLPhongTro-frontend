import React, { useState, useEffect } from 'react';
import axios from 'axios';
import classNames from 'classnames/bind';
import ReactPaginate from 'react-paginate';
import styles from './Support.module.scss';
import { getToken } from '~/utils/auth';

const cx = classNames.bind(styles);

const Support = () => {
    const [editSupports, setEditSupports] = useState(null);
    const [dataPage, setDataPage] = useState({ pageTotal: 0, pageNum: 0, adData: [] });
    const [url, setUrl] = useState(process.env.REACT_APP_API_ADMIN_SUPPORT);
    const [search, setSearch] = useState('');
    const [reply, setReply] = useState('');
    const [selectedSupportId, setSelectedSupportId] = useState(null);

    const handlePageClick = (event) => {
        setUrl(`${process.env.REACT_APP_API_ADMIN_SUPPORT}?page=${event.selected}`);
    };

    useEffect(() => {
        fetchSupports();
    }, [url]);

    const fetchSupports = () => {
        console.log({
            Authorization: `Bearer ${getToken()}`,
            'Content-Type': 'application/json',
        });
        axios
            .get(`${url}`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                    'Content-Type': 'application/json',
                },
            })
            .then((response) => {
                console.log(response.data);
                setDataPage(response.data);
            })
            .catch((error) => {
                console.error('There was an error fetching the supports!', error);
            });
    };
    const handleComplete = (id, status) => {
        axios
            .put(
                `http://localhost:8080/support-requests/change-status/${id}`,
                { status: 1 },
                {
                    headers: {
                        Authorization: `Bearer ${getToken()}`,
                        'Content-Type': 'application/json',
                    },
                },
            )
            .then((response) => {
                setDataPage((prevState) => ({
                    ...prevState,
                    adData: prevState.adData.map((ad) => (ad.id === id ? { ...ad, status: 1 } : ad)),
                }));
                fetchSupports();
            })
            .catch((error) => {
                console.error('There was an error updating the support status!', error);
            });
    };

    const handleReplyChange = (event) => {
        setReply(event.target.value);
    };

    const handleSendReply = (id) => {
        const support = dataPage.adData.find((ad) => ad.id === id);

        if (support) {
            axios
                .put(
                    `http://localhost:8080/support-requests/change-reply/${id}`,
                    { adminReply: reply },
                    {
                        headers: {
                            Authorization: `Bearer ${getToken()}`,
                            'Content-Type': 'application/json',
                        },
                    },
                )
                .then((response) => {
                    setDataPage((prevState) => ({
                        ...prevState,
                        adData: prevState.adData.map((ad) => (ad.id === id ? { ...ad, adminReply: reply } : ad)),
                    }));
                    setReply('');
                    setSelectedSupportId(null);
                    fetchSupports();
                })
                .catch((error) => {
                    console.error('There was an error sending the reply!', error);
                });
        }
    };

    const filteredSupports = dataPage.adData.filter((support) =>
        support.username.toLowerCase().includes(search.toLowerCase()),
    );

    return (
        <div className={cx('container')}>
            <h1>Quản lý hỗ trợ</h1>
            <input
                type="text"
                placeholder="Tìm kiếm theo username"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className={cx('searchInput')}
            />
            <table className={cx('supportTable')}>
                <thead>
                    <tr>
                        <th>ID</th>
                        <th>Username</th>
                        <th>Nội dung yêu cầu</th>
                        <th>Trả lời</th>
                        <th>Hành động</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredSupports.map((support) => (
                        <tr key={support.id}>
                            <td>{support.id}</td>
                            <td>{support.username}</td>
                            <td>{support.content}</td>
                            <td>
                                {support.admin_rely}
                                {selectedSupportId === support.id && (
                                    <div>
                                        <input
                                            type="text"
                                            value={reply}
                                            onChange={handleReplyChange}
                                            placeholder="Nhập hồi đáp"
                                            className={cx('replyInput')}
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-info btn-xs"
                                            onClick={() => handleSendReply(support.id)}
                                        >
                                            Gửi
                                        </button>
                                    </div>
                                )}
                            </td>
                            <td>
                                <button
                                    type="button"
                                    className="btn btn-info btn-xs"
                                    onClick={() => setSelectedSupportId(support.id)}
                                >
                                    Gửi hồi đáp
                                </button>
                                <button
                                    type="button"
                                    className="btn btn-info btn-xs"
                                    onClick={() => handleComplete(support.id, support.status)}
                                >
                                    Hoàn thành
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <ReactPaginate
                breakLabel="..."
                nextLabel="next >"
                onPageChange={handlePageClick}
                pageRangeDisplayed={2}
                pageCount={dataPage.pageTotal}
                previousLabel="< previous"
                renderOnZeroPageCount={null}
                containerClassName="pagination"
                pageLinkClassName="page-num"
                previousLinkClassName="page-num"
                nextLinkClassName="page-num"
                activeClassName="active"
            />
        </div>
    );
};

export default Support;
