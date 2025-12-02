const db = require('../config/db');
const ExcelJS = require('exceljs');
const PDFDocument = require('pdfkit');
const { sendSuccess, sendError } = require('../utils/responses');

// Export Assets to Excel
const exportAssetsToExcel = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        a.id,
        a.asset_tag,
        a.serial_number,
        a.name,
        a.brand,
        a.model,
        c.name as category,
        l.name as location,
        s.name as supplier,
        a.acquisition_date,
        a.acquisition_value,
        a.status,
        a.condition,
        a.notes
      FROM assets a
      LEFT JOIN categories c ON a.category_id = c.id
      LEFT JOIN locations l ON a.location_id = l.id
      LEFT JOIN suppliers s ON a.supplier_id = s.id
      ORDER BY a.id ASC
    `;
    
    const result = await db.query(query);
    const assets = result.rows;

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Activos');

    // Define columns
    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Etiqueta', key: 'asset_tag', width: 15 },
      { header: 'Serie', key: 'serial_number', width: 20 },
      { header: 'Nombre', key: 'name', width: 35 },
      { header: 'Marca', key: 'brand', width: 15 },
      { header: 'Modelo', key: 'model', width: 15 },
      { header: 'Categoría', key: 'category', width: 20 },
      { header: 'Ubicación', key: 'location', width: 20 },
      { header: 'Proveedor', key: 'supplier', width: 20 },
      { header: 'Fecha Adquisición', key: 'acquisition_date', width: 18 },
      { header: 'Valor', key: 'acquisition_value', width: 15 },
      { header: 'Estado', key: 'status', width: 15 },
      { header: 'Condición', key: 'condition', width: 15 },
      { header: 'Notas', key: 'notes', width: 30 }
    ];

    // Style header row
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF2563EB' }
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Add data rows
    assets.forEach(asset => {
      const row = worksheet.addRow({
        id: asset.id,
        asset_tag: asset.asset_tag,
        serial_number: asset.serial_number,
        name: asset.name,
        brand: asset.brand,
        model: asset.model,
        category: asset.category,
        location: asset.location,
        supplier: asset.supplier,
        acquisition_date: asset.acquisition_date ? new Date(asset.acquisition_date).toLocaleDateString('es-ES') : '',
        acquisition_value: parseFloat(asset.acquisition_value || 0),
        status: asset.status,
        condition: asset.condition,
        notes: asset.notes || ''
      });

      // Format currency column
      row.getCell('acquisition_value').numFmt = '$#,##0.00';
    });

    // Add autofilter
    worksheet.autoFilter = {
      from: 'A1',
      to: 'N1'
    };

    // Set response headers
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=activos_${new Date().toISOString().split('T')[0]}.xlsx`);

    // Write to buffer and send
    const buffer = await workbook.xlsx.writeBuffer();
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

// Export Users to Excel
const exportUsersToExcel = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        id,
        full_name,
        email,
        employee_id,
        department,
        job_title,
        active,
        created_at
      FROM users
      ORDER BY id ASC
    `;
    
    const result = await db.query(query);
    const users = result.rows;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Usuarios');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Nombre Completo', key: 'full_name', width: 30 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'ID Empleado', key: 'employee_id', width: 15 },
      { header: 'Departamento', key: 'department', width: 25 },
      { header: 'Cargo', key: 'job_title', width: 25 },
      { header: 'Activo', key: 'active', width: 10 },
      { header: 'Fecha Creación', key: 'created_at', width: 18 }
    ];

    // Style header
    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF10B981' }
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    // Add data
    users.forEach(user => {
      worksheet.addRow({
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        employee_id: user.employee_id,
        department: user.department,
        job_title: user.job_title,
        active: user.active ? 'Sí' : 'No',
        created_at: new Date(user.created_at).toLocaleDateString('es-ES')
      });
    });

    worksheet.autoFilter = { from: 'A1', to: 'H1' };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=usuarios_${new Date().toISOString().split('T')[0]}.xlsx`);

    const buffer = await workbook.xlsx.writeBuffer();
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

// Export Categories to Excel
const exportCategoriesToExcel = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        c.id,
        c.name,
        p.name as parent_category,
        c.active,
        COUNT(a.id) as asset_count
      FROM categories c
      LEFT JOIN categories p ON c.parent_id = p.id
      LEFT JOIN assets a ON a.category_id = c.id
      GROUP BY c.id, c.name, p.name, c.active
      ORDER BY c.id ASC
    `;
    
    const result = await db.query(query);
    const categories = result.rows;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Categorías');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Nombre', key: 'name', width: 30 },
      { header: 'Categoría Padre', key: 'parent_category', width: 30 },
      { header: 'Activo', key: 'active', width: 10 },
      { header: 'Cantidad Activos', key: 'asset_count', width: 18 }
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF8B5CF6' }
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    categories.forEach(cat => {
      worksheet.addRow({
        id: cat.id,
        name: cat.name,
        parent_category: cat.parent_category || 'N/A',
        active: cat.active ? 'Sí' : 'No',
        asset_count: parseInt(cat.asset_count || 0)
      });
    });

    worksheet.autoFilter = { from: 'A1', to: 'E1' };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=categorias_${new Date().toISOString().split('T')[0]}.xlsx`);

    const buffer = await workbook.xlsx.writeBuffer();
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

// Export Suppliers to Excel
const exportSuppliersToExcel = async (req, res, next) => {
  try {
    const query = `
      SELECT 
        s.id,
        s.name,
        s.tax_id,
        s.email,
        s.phone,
        s.contact_person,
        s.active,
        COUNT(a.id) as asset_count,
        COALESCE(SUM(a.acquisition_value), 0) as total_value
      FROM suppliers s
      LEFT JOIN assets a ON a.supplier_id = s.id
      GROUP BY s.id, s.name, s.tax_id, s.email, s.phone, s.contact_person, s.active
      ORDER BY s.id ASC
    `;
    
    const result = await db.query(query);
    const suppliers = result.rows;

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Proveedores');

    worksheet.columns = [
      { header: 'ID', key: 'id', width: 10 },
      { header: 'Nombre', key: 'name', width: 30 },
      { header: 'RFC/Tax ID', key: 'tax_id', width: 18 },
      { header: 'Email', key: 'email', width: 30 },
      { header: 'Teléfono', key: 'phone', width: 15 },
      { header: 'Persona Contacto', key: 'contact_person', width: 25 },
      { header: 'Activo', key: 'active', width: 10 },
      { header: 'Cantidad Activos', key: 'asset_count', width: 18 },
      { header: 'Valor Total', key: 'total_value', width: 18 }
    ];

    worksheet.getRow(1).font = { bold: true, color: { argb: 'FFFFFFFF' } };
    worksheet.getRow(1).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF59E0B' }
    };
    worksheet.getRow(1).alignment = { vertical: 'middle', horizontal: 'center' };

    suppliers.forEach(supplier => {
      const row = worksheet.addRow({
        id: supplier.id,
        name: supplier.name,
        tax_id: supplier.tax_id || '',
        email: supplier.email || '',
        phone: supplier.phone || '',
        contact_person: supplier.contact_person || '',
        active: supplier.active ? 'Sí' : 'No',
        asset_count: parseInt(supplier.asset_count || 0),
        total_value: parseFloat(supplier.total_value || 0)
      });

      row.getCell('total_value').numFmt = '$#,##0.00';
    });

    worksheet.autoFilter = { from: 'A1', to: 'I1' };

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename=proveedores_${new Date().toISOString().split('T')[0]}.xlsx`);

    const buffer = await workbook.xlsx.writeBuffer();
    res.send(buffer);
  } catch (error) {
    next(error);
  }
};

// Export Dashboard Summary to PDF
const exportDashboardToPDF = async (req, res, next) => {
  try {
    // Fetch dashboard data
    const summaryQuery = `
      SELECT 
        COUNT(*) as total_assets,
        COUNT(*) FILTER (WHERE status = 'active') as active_assets,
        COALESCE(SUM(acquisition_value), 0) as total_value
      FROM assets
    `;
    const summaryResult = await db.query(summaryQuery);
    const summary = summaryResult.rows[0];

    const statusQuery = `
      SELECT status, COUNT(*) as count 
      FROM assets 
      GROUP BY status
    `;
    const statusResult = await db.query(statusQuery);
    const statusData = statusResult.rows;

    // Create PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=dashboard_report_${new Date().toISOString().split('T')[0]}.pdf`);
    
    doc.pipe(res);

    // Header
    doc.fontSize(24).font('Helvetica-Bold').text('Reporte de Dashboard', { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).font('Helvetica').text(`Generado: ${new Date().toLocaleString('es-ES')}`, { align: 'center' });
    doc.moveDown(2);

    // Summary Section
    doc.fontSize(16).font('Helvetica-Bold').text('Resumen General');
    doc.moveDow();
    doc.fontSize(12).font('Helvetica');
    doc.text(`Total de Activos: ${summary.total_assets}`);
    doc.text(`Activos Activos: ${summary.active_assets}`);
    doc.text(`Valor Total: $${parseFloat(summary.total_value || 0).toLocaleString('es-ES', { minimumFractionDigits: 2 })}`);
    doc.moveDown(2);

    // Status Distribution
    doc.fontSize(16).font('Helvetica-Bold').text('Distribución por Estado');
    doc.moveDown();
    
    statusData.forEach(item => {
      doc.fontSize(12).font('Helvetica');
      doc.text(`  • ${item.status.charAt(0).toUpperCase() + item.status.slice(1)}: ${item.count} activos`);
    });

    doc.moveDown(3);
    
    // Footer
    doc.fontSize(10).font('Helvetica-Oblique')
       .text('Este reporte fue generado automáticamente por el Sistema de Inventario', 
             50, doc.page.height - 50, { align: 'center' });

    doc.end();
  } catch (error) {
    next(error);
  }
};

module.exports = {
  exportAssetsToExcel,
  exportUsersToExcel,
  exportCategoriesToExcel,
  exportSuppliersToExcel,
  exportDashboardToPDF
};
