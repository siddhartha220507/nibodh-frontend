import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import * as d3 from 'd3';
import { getAllItems } from '../api/itemApi';

const GraphView = () => {
    const svgRef = useRef(null);
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    // 1. Data Fetch Karna
    useEffect(() => {
        const fetchData = async () => {
            try {
                const data = await getAllItems();
                setItems(Array.isArray(data) ? data : data.items || []);
            } catch (error) {
                console.error("Graph data fetch fail:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    // 2. D3 Logic (Theme Aware)
    useEffect(() => {
        if (items.length === 0) return;

        const nodes = items.map(item => ({
            id: item._id,
            title: item.title,
            type: item.type,
            url: item.url,
            tags: item.tags || []
        }));

        const links = [];
        for (let i = 0; i < nodes.length; i++) {
            for (let j = i + 1; j < nodes.length; j++) {
                const commonTags = nodes[i].tags.filter(tag => nodes[j].tags.includes(tag));
                if (commonTags.length > 0) {
                    links.push({
                        source: nodes[i].id,
                        target: nodes[j].id,
                        value: commonTags.length 
                    });
                }
            }
        }

        // --- D3 SETUP ---
        // Width aur Height ab screen ke hisaab se (header minus karke)
        const width = window.innerWidth; 
        const height = window.innerHeight - 80; 

        d3.select(svgRef.current).selectAll("*").remove();

        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height)
            .call(d3.zoom().on("zoom", (event) => {
                svgGroup.attr("transform", event.transform);
            }));

        const svgGroup = svg.append("g");

        const simulation = d3.forceSimulation(nodes)
            .force("link", d3.forceLink(links).id(d => d.id).distance(150))
            .force("charge", d3.forceManyBody().strength(-300)) 
            .force("center", d3.forceCenter(width / 2, height / 2))
            .force("collide", d3.forceCollide().radius(50));

        // Draw Links (Theme Aware CSS Variable Use kiya hai)
        const link = svgGroup.append("g")
            .selectAll("line")
            .data(links)
            .join("line")
            .attr("stroke", "var(--border-color)") /* 👈 Fix: Theme-aware lines */
            .attr("stroke-opacity", 0.6)
            .attr("stroke-width", d => Math.sqrt(d.value) * 2); 

        const nodeColor = (type) => {
            switch(type) {
                case 'video': return '#ff4757';
                case 'article': return '#2ed573';
                case 'tweet': return '#1e90ff';
                default: return '#ffa502';
            }
        };

        const node = svgGroup.append("g")
            .selectAll("circle")
            .data(nodes)
            .join("circle")
            .attr("r", 15) 
            .attr("fill", d => nodeColor(d.type))
            .attr("stroke", "var(--bg-color)") /* 👈 Fix: Node ki border theme aware */
            .attr("stroke-width", 2)
            .call(drag(simulation))
            .on("click", (event, d) => window.open(d.url, '_blank')) 
            .on("mouseover", function() { d3.select(this).attr("r", 20); }) 
            .on("mouseout", function() { d3.select(this).attr("r", 15); });

        // Draw Labels (Theme Aware Text Color)
        const label = svgGroup.append("g")
            .selectAll("text")
            .data(nodes)
            .join("text")
            .text(d => d.title.length > 20 ? d.title.substring(0, 20) + '...' : d.title)
            .attr("font-size", "12px")
            .attr("font-weight", "500")
            .attr("dx", 18)
            .attr("dy", 4)
            .attr("fill", "var(--text-main)") /* 👈 Fix: Dark mode mein white, light mein black hoga */
            .style("pointer-events", "none"); 

        simulation.on("tick", () => {
            link
                .attr("x1", d => d.source.x)
                .attr("y1", d => d.source.y)
                .attr("x2", d => d.target.x)
                .attr("y2", d => d.target.y);

            node
                .attr("cx", d => d.x)
                .attr("cy", d => d.y);

            label
                .attr("x", d => d.x)
                .attr("y", d => d.y);
        });

        function drag(simulation) {
            function dragstarted(event) {
                if (!event.active) simulation.alphaTarget(0.3).restart();
                event.subject.fx = event.subject.x;
                event.subject.fy = event.subject.y;
            }
            function dragged(event) {
                event.subject.fx = event.x;
                event.subject.fy = event.y;
            }
            function dragended(event) {
                if (!event.active) simulation.alphaTarget(0);
                event.subject.fx = null;
                event.subject.fy = null;
            }
            return d3.drag().on("start", dragstarted).on("drag", dragged).on("end", dragended);
        }

    }, [items]);

    return (
        /* 👇 Fix: Background ab hardcoded nahi hai, var(--bg-color) hai */
        <div className="page-transition" style={{ display: 'flex', flexDirection: 'column', height: '100vh', width: '100vw', background: 'var(--bg-color)' }}>
            
            {/* 🌟 PREMIUM HEADER (Top Bar) */}
            <div className="graph-header">
                {/* Smooth Back Arrow Button */}
                <button onClick={() => navigate('/')} className="graph-back-btn" title="Go Back">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="19" y1="12" x2="5" y2="12"></line>
                        <polyline points="12 19 5 12 12 5"></polyline>
                    </svg>
                </button>

                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    {/* Professional Network Icon & Title */}
                    <h2 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--text-main)', fontSize: '22px', fontWeight: '800', letterSpacing: '-0.5px' }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="var(--text-muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <circle cx="18" cy="5" r="3"></circle>
                            <circle cx="6" cy="12" r="3"></circle>
                            <circle cx="18" cy="19" r="3"></circle>
                            <line x1="8.59" y1="13.51" x2="15.42" y2="17.49"></line>
                            <line x1="15.41" y1="6.51" x2="8.59" y2="10.49"></line>
                        </svg>
                        Neural Network
                    </h2>
                    {/* Professional Subtitle */}
                    <p style={{ margin: '4px 0 0 0', color: 'var(--text-muted)', fontSize: '13px', fontWeight: '500' }}>
                        Interactive mapping of your second brain. Scroll to zoom, drag nodes to explore connections.
                    </p>
                </div>
            </div>
            
            {/* 🕸️ GRAPH AREA */}
            <div style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
                {loading ? (
                    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                        Initializing Neural Net...
                    </div>
                ) : (
                    <svg ref={svgRef} style={{ width: '100%', height: '100%', cursor: 'grab' }}></svg>
                )}
            </div>
        </div>
    );
};

export default GraphView;