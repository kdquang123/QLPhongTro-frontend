import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { getToken } from '~/utils/auth';

function Report() {
    const [invoices, setInvoices] = useState([]);
    const [filter, setFilter] = useState('all');
    const [tenants, setTenants] = useState([]);
    const [selectedMonth, setSelectedMonth] = useState('all'); // Default 'all' for all months
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear()); // Default current year

    useEffect(() => {
        fetchInvoices();
    }, []);

    const fetchInvoices = () => {
        axios
            .get('http://localhost:8080/invoices/all', {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                    'Content-Type': 'application/json',
                },
            })
            .then((response) => {
                setInvoices(response.data);
                response.data.forEach((invoice) => {
                    fetchTenantsForRoom(invoice.room.id);
                });
            })
            .catch((error) => {
                console.error('Error fetching invoices:', error);
            });
    };

    const fetchTenantsForRoom = (roomId) => {
        axios
            .get(`http://localhost:8080/tenants/room/${roomId}`, {
                headers: {
                    Authorization: `Bearer ${getToken()}`,
                    'Content-Type': 'application/json',
                },
            })
            .then((response) => {
                setTenants((prevTenants) => {
                    const newTenants = [...prevTenants];
                    response.data.forEach((tenant) => {
                        if (!newTenants.some((t) => t.id === tenant.id)) {
                            newTenants.push(tenant);
                        }
                    });
                    return newTenants;
                });
            })
            .catch((error) => {
                console.error('Error fetching tenants:', error);
            });
    };

    const handleFilterChange = (event) => {
        setFilter(event.target.value);
    };

    const handleMonthChange = (event) => {
        setSelectedMonth(event.target.value);
    };

    const handleYearChange = (event) => {
        setSelectedYear(parseInt(event.target.value));
    };

    // Hàm lọc invoice theo năm, tháng và trạng thái
    const filterInvoices = () => {
        return invoices.filter((invoice) => {
            const invoiceDate = new Date(invoice.createdAt);
            const invoiceYear = invoiceDate.getFullYear();
            const invoiceMonth = invoiceDate.getMonth() + 1;

            // Kiểm tra năm
            const matchesYear = selectedYear === 'all' || invoiceYear === selectedYear;

            // Kiểm tra tháng
            const matchesMonth = selectedMonth === 'all' || parseInt(selectedMonth) === invoiceMonth;

            // Kiểm tra trạng thái
            const matchesStatus =
                filter === 'all' ||
                (filter === 'paid' && invoice.status === 1) ||
                (filter === 'unpaid' && invoice.status === 0);

            return matchesYear && matchesMonth && matchesStatus;
        });
    };

    const getRepresentative = (roomId) => {
        const representative = tenants.find((tenant) => tenant.room?.id === roomId && tenant.isRepresentative === 1);
        return representative ? representative.fullName : 'No representative';
    };

    // Tạo mảng các tháng cho dropdown
    const getMonthOptions = () => {
        const months = [];
        for (let i = 1; i <= 12; i++) {
            months.push(i);
        }
        return months;
    };

    // Tạo mảng các năm cho dropdown (5 năm gần đây)
    const getYearOptions = () => {
        const years = [];
        const currentYear = new Date().getFullYear();
        for (let i = 0; i < 5; i++) {
            years.push(currentYear - i);
        }
        return years;
    };

    // Tính tổng tiền của các hóa đơn đã lọc
    const calculateTotal = () => {
        return filterInvoices().reduce((sum, invoice) => sum + (invoice.total || 0), 0);
    };

    return (
        <div className="x_panel">
            <div className="x_title">
                <h2>
                    <strong>Báo cáo hóa đơn</strong>
                </h2>
                <div className="clearfix"></div>
            </div>

            <div className="x_content">
                <div className="form-group row">
                    <div className="col-md-3">
                        <label>Trạng thái:</label>
                        <select className="form-control" value={filter} onChange={handleFilterChange}>
                            <option value="all">Tất cả</option>
                            <option value="paid">Đã thanh toán</option>
                            <option value="unpaid">Chưa thanh toán</option>
                        </select>
                    </div>

                    <div className="col-md-3">
                        <label>Chọn năm:</label>
                        <select className="form-control" value={selectedYear} onChange={handleYearChange}>
                            <option value="all">Tất cả năm</option>
                            {getYearOptions().map((year) => (
                                <option key={year} value={year}>
                                    {year}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="col-md-3">
                        <label>Chọn tháng:</label>
                        <select className="form-control" value={selectedMonth} onChange={handleMonthChange}>
                            <option value="all">Tất cả tháng</option>
                            {getMonthOptions().map((month) => (
                                <option key={month} value={month}>
                                    Tháng {month}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="total-section mb-3">
                    <h4>Tổng tiền: {calculateTotal().toLocaleString()} VND</h4>
                </div>

                <table className="table table-striped table-bordered">
                    <thead>
                        <tr>
                            <th>Mã hóa đơn</th>
                            <th>Số phòng</th>
                            <th>Người đại diện</th>
                            <th>Tổng (VND)</th>
                            <th>Ngày tạo</th>
                            <th>Trạng thái</th>
                        </tr>
                    </thead>
                    <tbody>
                        {filterInvoices().map((invoice) => (
                            <tr key={invoice.id}>
                                <td>{invoice.id}</td>
                                <td>{invoice.room?.id}</td>
                                <td>{getRepresentative(invoice.room?.id)}</td>
                                <td>{invoice.total?.toLocaleString()}</td>
                                <td>{new Date(invoice.createdAt).toLocaleDateString()}</td>
                                <td>{invoice.status === 1 ? 'Đã thanh toán' : 'Chưa thanh toán'}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

export default Report;
