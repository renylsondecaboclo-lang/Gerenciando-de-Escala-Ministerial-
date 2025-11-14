import React, { useState } from 'react';
import { useData } from '../contexts/DataContext';
import { ReportIcon } from './icons';

// Make TypeScript aware of the global objects from the CDNs
declare global {
    interface Window {
        jspdf: any;
        XLSX: any;
    }
}

type ReportType = 'ministerio' | 'servo' | 'periodo';
type ExportFormat = 'excel' | 'pdf' | 'csv';

const ReportsView: React.FC = () => {
    const { escalas, servos, funcoes, ministerios } = useData();
    const [reportType, setReportType] = useState<ReportType>('ministerio');
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [selectedServoId, setSelectedServoId] = useState<string>('');
    const [format, setFormat] = useState<ExportFormat>('excel');
    const [isLoading, setIsLoading] = useState(false);

    const handleGenerateReport = () => {
        if (!startDate || !endDate) {
            alert('Por favor, selecione um período de início e fim.');
            return;
        }
        if (reportType === 'servo' && !selectedServoId) {
            alert('Por favor, selecione um servo.');
            return;
        }

        setIsLoading(true);

        const start = new Date(startDate + 'T00:00:00');
        const end = new Date(endDate + 'T23:59:59');

        const filteredEscalas = escalas.filter(escala => {
            const escalaDate = new Date(escala.data + 'T00:00:00');
            return escalaDate >= start && escalaDate <= end;
        });

        let reportData: any[] = [];
        let columns: { header: string, dataKey: string }[] = [];
        let fileName = `Relatorio_${reportType}_${startDate}_a_${endDate}`;

        switch (reportType) {
            case 'ministerio':
                const ministryCounts: { [key: string]: { [key: string]: number } } = {};
                filteredEscalas.forEach(escala => {
                    escala.itens.forEach(item => {
                        const servo = servos.find(s => s.id === item.servoId);
                        const funcao = funcoes.find(f => f.id === item.funcaoId);
                        const ministerio = ministerios.find(m => m.id === funcao?.ministerioId);
                        if (servo && ministerio) {
                            if (!ministryCounts[ministerio.nome]) ministryCounts[ministerio.nome] = {};
                            if (!ministryCounts[ministerio.nome][servo.nome]) ministryCounts[ministerio.nome][servo.nome] = 0;
                            ministryCounts[ministerio.nome][servo.nome]++;
                        }
                    });
                });
                reportData = Object.entries(ministryCounts).flatMap(([ministerio, servoCounts]) => 
                    Object.entries(servoCounts).map(([servo, participacoes]) => ({ ministerio, servo, participacoes }))
                );
                columns = [
                    { header: 'Ministério', dataKey: 'ministerio' },
                    { header: 'Servo', dataKey: 'servo' },
                    { header: 'Participações', dataKey: 'participacoes' },
                ];
                break;
            
            case 'servo':
                const servo = servos.find(s => s.id === parseInt(selectedServoId));
                fileName = `Relatorio_${servo?.nome.replace(' ', '_')}_${startDate}_a_${endDate}`;
                filteredEscalas.forEach(escala => {
                    escala.itens.forEach(item => {
                        if (item.servoId === parseInt(selectedServoId)) {
                            const funcao = funcoes.find(f => f.id === item.funcaoId);
                            const ministerio = ministerios.find(m => m.id === funcao?.ministerioId);
                            reportData.push({
                                data: new Date(escala.data + 'T00:00:00').toLocaleDateString('pt-BR'),
                                ministerio: ministerio?.nome || 'N/A',
                                funcao: funcao?.nome || 'N/A',
                            });
                        }
                    });
                });
                columns = [
                    { header: 'Data', dataKey: 'data' },
                    { header: 'Ministério', dataKey: 'ministerio' },
                    { header: 'Função', dataKey: 'funcao' },
                ];
                break;

            case 'periodo':
                filteredEscalas.forEach(escala => {
                     escala.itens.forEach(item => {
                        const servo = servos.find(s => s.id === item.servoId);
                        const funcao = funcoes.find(f => f.id === item.funcaoId);
                        const ministerio = ministerios.find(m => m.id === funcao?.ministerioId);
                        if (servo && funcao && ministerio) {
                            reportData.push({
                                data: new Date(escala.data + 'T00:00:00').toLocaleDateString('pt-BR'),
                                ministerio: ministerio.nome,
                                funcao: funcao.nome,
                                servo: servo.nome,
                            });
                        }
                     });
                });
                columns = [
                    { header: 'Data', dataKey: 'data' },
                    { header: 'Ministério', dataKey: 'ministerio' },
                    { header: 'Função', dataKey: 'funcao' },
                    { header: 'Servo', dataKey: 'servo' },
                ];
                break;
        }

        if (format === 'pdf') {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            doc.autoTable({
                head: [columns.map(c => c.header)],
                body: reportData.map(row => columns.map(c => row[c.dataKey])),
            });
            doc.save(`${fileName}.pdf`);
        } else {
            const worksheet = window.XLSX.utils.json_to_sheet(reportData);
            const workbook = window.XLSX.utils.book_new();
            window.XLSX.utils.book_append_sheet(workbook, worksheet, 'Relatório');
            window.XLSX.writeFile(workbook, `${fileName}.${format === 'excel' ? 'xlsx' : 'csv'}`);
        }

        setIsLoading(false);
    };

    const inputStyle = "w-full p-2 rounded bg-black text-white placeholder-white/70 border border-gray-600 focus:border-accent focus:ring-accent focus:ring-1 disabled:opacity-50";

    return (
        <div className="space-y-6 animate-fade-in-up text-white">
            <div className="text-center">
                <h2 className="text-3xl font-bold font-display">Relatórios</h2>
                <p className="text-white/80">Exporte dados de escalas e participação dos servos.</p>
            </div>

            <div className="bg-white/10 p-6 rounded-lg shadow-2xl space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="report-type" className="block text-sm font-medium mb-1">Tipo de Relatório</label>
                        <select id="report-type" value={reportType} onChange={(e) => setReportType(e.target.value as ReportType)} className={inputStyle}>
                            <option value="ministerio">Por Ministério</option>
                            <option value="servo">Por Servo</option>
                            <option value="periodo">Escalas por Período</option>
                        </select>
                    </div>

                    {reportType === 'servo' && (
                        <div>
                            <label htmlFor="servo-select" className="block text-sm font-medium mb-1">Selecione o Servo</label>
                            <select id="servo-select" value={selectedServoId} onChange={(e) => setSelectedServoId(e.target.value)} className={inputStyle}>
                                <option value="" disabled>Selecione...</option>
                                {servos.filter(s => s.ativo).map(servo => (
                                    <option key={servo.id} value={servo.id}>{servo.nome}</option>
                                ))}
                            </select>
                        </div>
                    )}

                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">Período</label>
                        <div className="flex items-center gap-2">
                            <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputStyle} />
                            <span className="font-bold">até</span>
                            <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputStyle} />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="report-format" className="block text-sm font-medium mb-1">Formato de Exportação</label>
                        <select id="report-format" value={format} onChange={(e) => setFormat(e.target.value as ExportFormat)} className={inputStyle}>
                            <option value="excel">Excel (.xlsx)</option>
                            <option value="pdf">PDF (.pdf)</option>
                            <option value="csv">CSV (.csv)</option>
                        </select>
                    </div>
                </div>

                <button 
                    onClick={handleGenerateReport}
                    disabled={isLoading}
                    className="w-full bg-accent text-white py-3 rounded-lg font-bold text-lg flex items-center justify-center space-x-2 hover:bg-opacity-90 transition-transform hover:scale-105 disabled:bg-gray-500 disabled:scale-100"
                >
                    <ReportIcon size={22} />
                    <span>{isLoading ? 'Gerando...' : 'Gerar Relatório'}</span>
                </button>
            </div>
        </div>
    );
};

export default ReportsView;