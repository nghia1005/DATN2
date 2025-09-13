"use client";
import React, { useState } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { registerLocale } from "react-datepicker";
import { vi } from "date-fns/locale";

registerLocale("vi", vi);

export default function DatePickerTestPage() {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);

    return (
        <div style={{ padding: 50, background: '#f5f5f5', minHeight: '100vh' }}>
            <h1>DatePicker Test</h1>
            
            <div style={{ margin: 20 }}>
                <label style={{ display: 'block', marginBottom: 10 }}>
                    Chọn ngày sinh:
                </label>
                
                <DatePicker
                    selected={selectedDate}
                    onChange={(date) => setSelectedDate(date)}
                    dateFormat="dd/MM/yyyy"
                    placeholderText="Chọn ngày sinh"
                    showMonthDropdown
                    showYearDropdown
                    scrollableYearDropdown
                    yearDropdownItemNumber={100}
                    minDate={new Date(1900, 0, 1)}
                    maxDate={new Date()}
                    locale="vi"
                    openToDate={new Date(1990, 0, 1)}
                    isClearable={false}
                    customInput={
                        <input
                            style={{
                                width: "300px",
                                padding: "12px 16px",
                                borderRadius: 8,
                                border: "2px solid #ccc",
                                fontSize: "14px",
                                outline: "none"
                            }}
                        />
                    }
                />
            </div>
            
            <div style={{ margin: 20 }}>
                <p>Ngày đã chọn: {selectedDate ? selectedDate.toLocaleDateString('vi-VN') : 'Chưa chọn'}</p>
            </div>
        </div>
    );
} 