import * as XLSX from 'xlsx';

/**
 * Exports data to an Excel file
 * @param {Array} data - Array of objects to export
 * @param {String} fileName - Name of the file (without extension)
 * @param {Array} headers - Optional array of custom header labels
 */
export const exportToExcel = (data, fileName = 'export', headers = null) => {
    const worksheet = XLSX.utils.json_to_sheet(data);
    
    if (headers) {
        XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: "A1" });
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1");
    XLSX.writeFile(workbook, `${fileName}_${new Date().getTime()}.xlsx`);
};

/**
 * Reads an Excel file and returns JSON data
 * @param {File} file - The uploaded file object
 * @returns {Promise<Array>} - Resolves with an array of objects
 */
export const readExcel = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result);
                const workbook = XLSX.read(data, { type: 'array' });
                const firstSheetName = workbook.SheetNames[0];
                const worksheet = workbook.Sheets[firstSheetName];
                const json = XLSX.utils.sheet_to_json(worksheet);
                resolve(json);
            } catch (error) {
                reject(error);
            }
        };
        reader.onerror = (error) => reject(error);
        reader.readAsArrayBuffer(file);
    });
};

/**
 * Downloads a sample Excel template for data import
 * @param {String} type - 'walkin', 'workreport', or 'monthly'
 */
export const downloadTemplate = (type) => {
    let headers = [];
    let sampleData = [];
    let fileName = '';

    switch (type) {
        case 'walkin':
            headers = ['clientName', 'contactNumber', 'project', 'showroom', 'dateOfVisit', 'inTime', 'outTime', 'remarks'];
            sampleData = [{
                clientName: 'Rahul Sharma',
                contactNumber: '9876543210',
                project: 'Villas',
                showroom: 'MTRS',
                dateOfVisit: '2026-04-01',
                inTime: '10:00 AM',
                outTime: '11:30 AM',
                remarks: 'Walk-in for modular kitchen'
            }];
            fileName = 'walkin_template';
            break;
        case 'workreport':
            headers = ['date', 'clientName', 'contact', 'showroom', 'status', 'site', 'star', 'remarks'];
            sampleData = [{
                date: '2026-04-01',
                clientName: 'Anjali Gupta',
                contact: '8765432109',
                showroom: 'MTRS',
                status: 'Y',
                site: 'MG Road',
                star: 5,
                remarks: 'Client interested in wardrobes'
            }];
            fileName = 'workreport_template';
            break;
        case 'monthly':
            headers = ['month', 'year', 'calls', 'srv', 'proposals', 'orders', 'value'];
            sampleData = [{
                month: 4,
                year: 2026,
                calls: 150,
                srv: 45,
                proposals: 20,
                orders: 12,
                value: 45.5
            }];
            fileName = 'monthly_performance_template';
            break;
    }

    const worksheet = XLSX.utils.json_to_sheet(sampleData, { header: headers });
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Template");
    XLSX.writeFile(workbook, `${fileName}.xlsx`);
};
