export default {
  // User Management
  'GET /api/go-sample/users': {
    success: true,
    data: [
      {
        id: '1',
        name: 'Moch. Aby Gazal',
        email: 'aby.gazal@pertamina.com',
        role: 'sample-officer',
        department: 'pertamina',
        status: 'active',
        createdAt: '2025-01-01',
      },
      {
        id: '2',
        name: 'Sedry Muhammad Iqbal',
        email: 'sedry.iqbal@pertamina.com',
        role: 'supervisor',
        department: 'pertamina',
        status: 'active',
        createdAt: '2025-01-02',
      },
      {
        id: '3',
        name: 'Dr. Ahmad Laboratorium',
        email: 'ahmad.lab@lpuj.co.id',
        role: 'lab-staff',
        department: 'laboratory',
        status: 'active',
        createdAt: '2025-01-03',
      },
    ],
    total: 3,
  },

  'POST /api/go-sample/users': {
    success: true,
    data: {
      id: '4',
      name: 'New User',
      email: 'newuser@example.com',
      role: 'sample-officer',
      department: 'pertamina',
      status: 'active',
      createdAt: '2025-08-06',
    },
    message: 'User created successfully',
  },

  'PUT /api/go-sample/users/:id': {
    success: true,
    data: {
      id: '1',
      name: 'Updated User',
      email: 'updated@example.com',
      role: 'supervisor',
      department: 'pertamina',
      status: 'active',
      createdAt: '2025-01-01',
    },
    message: 'User updated successfully',
  },

  'DELETE /api/go-sample/users/:id': {
    success: true,
    message: 'User deleted successfully',
  },

  // Stock Management
  'GET /api/go-sample/stocks': {
    success: true,
    data: [
      {
        id: '1',
        productType: 'jet-a1',
        category: 'Aviation Fuel',
        shipName: 'MT. Commodore One',
        compartment: 'T.107',
        quantity: 5000,
        unit: 'Liter',
        estimatedDate: '2025-08-08',
        status: 'available',
        createdAt: '2025-08-06',
      },
      {
        id: '2',
        productType: 'avgas',
        category: 'Aviation Gasoline',
        shipName: 'MT. Pioneer',
        compartment: 'T.205',
        quantity: 1500,
        unit: 'Liter',
        estimatedDate: '2025-08-07',
        status: 'limited',
        createdAt: '2025-08-05',
      },
      {
        id: '3',
        productType: 'jet-a1',
        category: 'Aviation Fuel',
        shipName: 'MT. Explorer',
        compartment: 'T.301',
        quantity: 0,
        unit: 'Liter',
        estimatedDate: '2025-08-09',
        status: 'empty',
        createdAt: '2025-08-04',
      },
    ],
    total: 3,
  },

  'POST /api/go-sample/stocks': {
    success: true,
    data: {
      id: '4',
      productType: 'jet-a1',
      category: 'Aviation Fuel',
      shipName: 'MT. New Ship',
      compartment: 'T.101',
      quantity: 3000,
      unit: 'Liter',
      estimatedDate: '2025-08-10',
      status: 'available',
      createdAt: '2025-08-06',
    },
    message: 'Stock created successfully',
  },

  // Sample Orders
  'GET /api/go-sample/sample-orders': {
    success: true,
    data: [
      {
        id: '1',
        orderNumber: 'ORD-20250806-001',
        orderType: 'request',
        productType: 'JET A-1',
        shipName: 'MT. Commodore One',
        tankNumber: 'T.107',
        quantity: 4,
        unit: 'Botol',
        laboratory: 'LPUJ',
        estimatedTime: '1 jam',
        priority: 'normal',
        status: 'confirmed',
        createdAt: '2025-08-06T08:00:00Z',
        updatedAt: '2025-08-06T08:30:00Z',
      },
      {
        id: '2',
        orderNumber: 'ORD-20250805-002',
        orderType: 'stock',
        productType: 'Avgas',
        shipName: 'MT. Pioneer',
        quantity: 2,
        unit: 'Botol',
        laboratory: 'Lemigas',
        estimatedTime: '1 jam',
        priority: 'urgent',
        status: 'in-transit',
        createdAt: '2025-08-05T14:00:00Z',
        updatedAt: '2025-08-05T15:00:00Z',
      },
    ],
    total: 2,
  },

  'POST /api/go-sample/sample-orders': {
    success: true,
    data: {
      id: '3',
      orderNumber: 'ORD-20250806-003',
      orderType: 'request',
      productType: 'JET A-1',
      shipName: 'MT. New Ship',
      tankNumber: 'T.101',
      quantity: 3,
      unit: 'Botol',
      laboratory: 'LPUJ',
      estimatedTime: '1 jam',
      priority: 'normal',
      status: 'pending',
      createdAt: '2025-08-06T10:00:00Z',
      updatedAt: '2025-08-06T10:00:00Z',
    },
    message: 'Sample order created successfully',
  },

  // Laboratory Testing
  'GET /api/go-sample/test-results': {
    success: true,
    data: [
      {
        id: '1',
        sampleCode: 'LPUJ-20250806-001',
        productType: 'JET A-1',
        shipName: 'MT. Commodore One',
        laboratory: 'LPUJ',
        receivedDate: '2025-08-06',
        testStatus: 'testing',
        testProgress: 65,
        currentEquipment: 'Density Meter DMM-5000',
        estimatedCompletion: '2025-08-06T16:00:00Z',
        testResults: {
          density: 0.795,
          waterContent: 0.003,
        },
      },
      {
        id: '2',
        sampleCode: 'LMG-20250805-002',
        productType: 'Avgas',
        shipName: 'MT. Pioneer',
        laboratory: 'Lemigas',
        receivedDate: '2025-08-05',
        testStatus: 'completed',
        testProgress: 100,
        testResults: {
          density: 0.720,
          viscosity: 1.2,
          waterContent: 0.002,
          flashPoint: 38,
        },
      },
      {
        id: '3',
        sampleCode: 'LPUJ-20250806-003',
        productType: 'JET A-1',
        shipName: 'MT. Explorer',
        laboratory: 'LPUJ',
        receivedDate: '2025-08-06',
        testStatus: 'received',
        testProgress: 0,
      },
    ],
    total: 3,
  },

  'PUT /api/go-sample/test-results/:id': {
    success: true,
    data: {
      id: '1',
      sampleCode: 'LPUJ-20250806-001',
      productType: 'JET A-1',
      shipName: 'MT. Commodore One',
      laboratory: 'LPUJ',
      receivedDate: '2025-08-06',
      testStatus: 'completed',
      testProgress: 100,
      testResults: {
        density: 0.795,
        viscosity: 1.5,
        waterContent: 0.003,
        flashPoint: 42,
      },
    },
    message: 'Test result updated successfully',
  },

  // Dashboard Stats
  'GET /api/go-sample/dashboard/stats': {
    success: true,
    data: {
      totalTests: 123,
      completedTests: 107,
      processingTests: 16,
      successRate: 87,
      weeklyStats: [
        { date: '2025-07-30', success: 12, failed: 3 },
        { date: '2025-07-31', success: 15, failed: 2 },
        { date: '2025-08-01', success: 18, failed: 1 },
        { date: '2025-08-02', success: 14, failed: 4 },
        { date: '2025-08-03', success: 16, failed: 2 },
        { date: '2025-08-04', success: 13, failed: 3 },
        { date: '2025-08-05', success: 19, failed: 1 },
      ],
    },
  },

  'GET /api/go-sample/dashboard/calendar': {
    success: true,
    data: {
      '2025-08-06': [
        { type: 'success', content: 'Stock Tersedia - JET A-1' },
        { type: 'warning', content: 'Stock Terbatas - Avgas' },
      ],
      '2025-08-07': [
        { type: 'error', content: 'Stock Kosong - JET A-1' },
      ],
      '2025-08-08': [
        { type: 'success', content: 'Stock Tersedia - JET A-1' },
        { type: 'success', content: 'Stock Tersedia - Avgas' },
      ],
      '2025-08-09': [
        { type: 'warning', content: 'Stock Terbatas - JET A-1' },
      ],
      '2025-08-10': [
        { type: 'success', content: 'Stock Tersedia - JET A-1' },
      ],
    },
  },

  // Comparison Results
  'GET /api/go-sample/comparisons': {
    success: true,
    data: [
      {
        id: '1',
        sampleCode: 'LPUJ-20250805-001',
        productType: 'JET A-1',
        testResults: {
          density: 0.795,
          viscosity: 1.5,
          waterContent: 0.003,
          flashPoint: 42,
        },
        standards: {
          density: { min: 0.775, max: 0.840 },
          viscosity: { min: 1.25, max: 8.0 },
          waterContent: { max: 0.015 },
          flashPoint: { min: 38 },
        },
        comparisonStatus: 'on-spec',
        finalStatus: 'release',
        createdAt: '2025-08-05T16:00:00Z',
      },
      {
        id: '2',
        sampleCode: 'LMG-20250804-002',
        productType: 'Avgas',
        testResults: {
          density: 0.740,
          viscosity: 1.1,
          waterContent: 0.020,
          flashPoint: 35,
        },
        standards: {
          density: { min: 0.700, max: 0.775 },
          viscosity: { min: 1.0, max: 7.0 },
          waterContent: { max: 0.015 },
          flashPoint: { min: 38 },
        },
        comparisonStatus: 'off-spec',
        finalStatus: 'repeat',
        createdAt: '2025-08-04T14:30:00Z',
      },
    ],
    total: 2,
  },

  // Stock Opname
  'GET /api/go-sample/stock-opnames': {
    success: true,
    data: [
      {
        id: '1',
        sampleCode: 'LPUJ-20250806-001',
        productType: 'JET A-1',
        laboratory: 'LPUJ',
        currentStock: 4,
        usedQuantity: 2,
        remainingQuantity: 2,
        status: 'available',
        lastUpdated: '2025-08-06T14:00:00Z',
      },
      {
        id: '2',
        sampleCode: 'LMG-20250805-002',
        productType: 'Avgas',
        laboratory: 'Lemigas',
        currentStock: 3,
        usedQuantity: 3,
        remainingQuantity: 0,
        status: 'used',
        lastUpdated: '2025-08-05T16:30:00Z',
      },
    ],
    total: 2,
  },

  // Monitoring
  'GET /api/go-sample/monitoring/realtime': {
    success: true,
    data: {
      samples: [
        {
          id: '1',
          code: 'TRANS-20250806-001',
          status: 'in-transit',
          location: 'Tol Jakarta-Cikampek KM 15',
          estimatedArrival: '2025-08-06T16:30:00Z',
          issues: ['Kemacetan lalu lintas'],
        },
        {
          id: '2',
          code: 'LPUJ-20250806-002',
          status: 'testing',
          location: 'Lab LPUJ - Density Testing',
          estimatedArrival: null,
          issues: [],
        },
      ],
    },
  },
  // Stock Opname endpoints
  'GET /api/stock-opname': (req: any, res: any) => {
    const mockData = [
      {
        id: '1',
        sampleCode: 'LPUJ-20250806-001',
        productType: 'JET A-1',
        laboratory: 'LPUJ',
        initialStock: 4,
        currentStock: 2,
        usedQuantity: 2,
        remainingQuantity: 2,
        unit: 'Botol',
        status: 'available',
        receivedDate: '2025-08-06',
        lastUpdated: '2025-08-06T14:00:00Z',
        notes: 'Pengujian density dan viscosity selesai',
      },
      {
        id: '2',
        sampleCode: 'LMG-20250805-002',
        productType: 'Avgas',
        laboratory: 'Lemigas',
        initialStock: 3,
        currentStock: 0,
        usedQuantity: 3,
        remainingQuantity: 0,
        unit: 'Botol',
        status: 'used',
        receivedDate: '2025-08-05',
        lastUpdated: '2025-08-05T16:30:00Z',
        notes: 'Semua sampel telah digunakan untuk pengujian lengkap',
      },
    ];

    setTimeout(() => {
      res.json({
        data: mockData,
        success: true,
        total: mockData.length,
      });
    }, 300);
  },

  'PUT /api/stock-opname/:id': (req: any, res: any) => {
    setTimeout(() => {
      res.json({
        success: true,
        message: 'Stock opname updated successfully',
      });
    }, 300);
  },

  // Comparison endpoints
  'GET /api/comparison/quality': (req: any, res: any) => {
    const mockData = [
      {
        id: '1',
        parameter: 'Density at 15°C',
        standardValue: '775-840',
        actualValue: '785.2',
        unit: 'kg/m³',
        status: 'pass',
        difference: 'Within range',
      },
      {
        id: '2',
        parameter: 'Water Content',
        standardValue: 'Max 0.003',
        actualValue: '0.0045',
        unit: '%v/v',
        status: 'fail',
        difference: '+0.0015 above max',
      },
    ];

    setTimeout(() => {
      res.json({
        data: mockData,
        success: true,
      });
    }, 300);
  },

  'POST /api/comparison/documents': (req: any, res: any) => {
    setTimeout(() => {
      res.json({
        success: true,
        message: 'Document comparison started',
        comparisonId: 'comp_' + Date.now(),
      });
    }, 300);
  },

  // Reports endpoints
  'GET /api/reports': (req: any, res: any) => {
    const mockData = [
      {
        id: '1',
        reportType: 'daily',
        dateRange: '2025-08-06',
        laboratory: 'LPUJ',
        totalSamples: 15,
        completedTests: 15,
        pendingTests: 0,
        status: 'ready',
        generatedBy: 'Admin User',
        createdAt: '2025-08-06T16:00:00Z',
      },
      {
        id: '2',
        reportType: 'weekly',
        dateRange: '2025-08-01 - 2025-08-07',
        laboratory: 'All Laboratories',
        totalSamples: 87,
        completedTests: 78,
        pendingTests: 9,
        status: 'ready',
        generatedBy: 'Report System',
        createdAt: '2025-08-06T09:00:00Z',
      },
    ];

    setTimeout(() => {
      res.json({
        data: mockData,
        success: true,
        total: mockData.length,
      });
    }, 300);
  },

  'POST /api/reports/generate': (req: any, res: any) => {
    setTimeout(() => {
      res.json({
        success: true,
        message: 'Report generation started',
        reportId: 'rpt_' + Date.now(),
      });
    }, 1000);
  },

  'GET /api/reports/:id/download': (req: any, res: any) => {
    setTimeout(() => {
      res.json({
        success: true,
        downloadUrl: '/downloads/report_' + req.params.id + '.pdf',
      });
    }, 300);
  },
};
