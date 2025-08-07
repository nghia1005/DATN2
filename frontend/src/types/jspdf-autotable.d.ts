import 'jspdf';
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (...args: any[]) => jsPDF;
    lastAutoTable?: {
      finalY?: number;
      [key: string]: any;
    };
  }
}

declare module "jspdf-autotable";
declare module 'html2pdf.js'; 