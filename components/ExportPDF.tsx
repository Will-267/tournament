
import React from 'react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Tournament } from '../types';
import { calculateAllStandings } from '../utils/tournament';
import { DownloadIcon } from './IconComponents';

interface ExportPDFProps {
    tournament: Tournament;
}

const ExportPDF: React.FC<ExportPDFProps> = ({ tournament }) => {
    const handleExport = () => {
        const doc = new jsPDF();
        const standings = calculateAllStandings(tournament.groups, tournament.matches);

        doc.setFontSize(18);
        doc.text(tournament.name, 14, 22);
        doc.setFontSize(11);
        doc.setTextColor(100);
        doc.text(`Standings as of ${new Date().toLocaleDateString()}`, 14, 28);

        let startY = 35;

        tournament.groups.forEach((group, index) => {
            const groupStandings = standings[group.id] || [];
            
            if (groupStandings.length > 0) {
                 const tableBody = groupStandings.map(s => [
                    s.rank,
                    s.playerName,
                    s.teamName,
                    s.played,
                    s.wins,
                    s.draws,
                    s.losses,
                    s.goalDifference > 0 ? `+${s.goalDifference}` : s.goalDifference,
                    s.points
                ]);

                 autoTable(doc, {
                    startY: startY,
                    head: [['#', 'Player', 'Team', 'P', 'W', 'D', 'L', 'GD', 'Pts']],
                    body: tableBody,
                    theme: 'grid',
                    didDrawPage: (data) => {
                        // Header
                        doc.setFontSize(14);
                        doc.setTextColor(40);
                        doc.text(group.name, data.settings.margin.left, startY - 6);
                    },
                    margin: { top: startY }, // We handle title manually
                    bodyStyles: { fontSize: 9 },
                    columnStyles: {
                        0: { halign: 'center', cellWidth: 10 }, // Rank
                        1: { cellWidth: 'auto' }, // Player
                        2: { cellWidth: 'auto' }, // Team
                        3: { halign: 'center', cellWidth: 10 }, // P
                        4: { halign: 'center', cellWidth: 10 }, // W
                        5: { halign: 'center', cellWidth: 10 }, // D
                        6: { halign: 'center', cellWidth: 10 }, // L
                        7: { halign: 'center', cellWidth: 10 }, // GD
                        8: { halign: 'center', cellWidth: 10, fontStyle: 'bold' }, // Pts
                    }
                });
                startY = (doc as any).lastAutoTable.finalY + 15;
            }
        });
        
        doc.save(`${tournament.name.replace(/\s/g, '_')}_Standings.pdf`);
    };

    return (
        <button
            onClick={handleExport}
            aria-label="Export standings to PDF"
            className="flex items-center gap-2 bg-gray-700/50 hover:bg-gray-700 border border-gray-600 rounded-full px-4 py-1 text-sm text-cyan-300 transition-colors"
        >
            <DownloadIcon className="w-4 h-4" />
            <span>Export to PDF</span>
        </button>
    );
};

export default ExportPDF;
