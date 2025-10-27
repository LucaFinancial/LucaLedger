import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import { Box } from '@mui/material';

export default function CategoryTree({ categories }) {
  const svgRef = useRef(null);
  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 800, height: 600 });

  // Update dimensions on resize
  useEffect(() => {
    const updateDimensions = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth;
        const height = Math.max(600, window.innerHeight - 300);
        setDimensions({ width, height });
      }
    };

    updateDimensions();
    window.addEventListener('resize', updateDimensions);
    return () => window.removeEventListener('resize', updateDimensions);
  }, []);

  useEffect(() => {
    if (!svgRef.current || !categories || categories.length === 0) return;

    // Clear previous content
    d3.select(svgRef.current).selectAll('*').remove();

    const svg = d3.select(svgRef.current);
    const width = dimensions.width;
    const height = dimensions.height;

    // Create zoom behavior
    const zoom = d3
      .zoom()
      .scaleExtent([0.5, 3])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
      });

    // Apply zoom to svg
    svg.call(zoom);

    // Create a container group for the tree
    const g = svg.append('g').attr('transform', `translate(${width / 2},${100})`);

    // Transform categories data into hierarchical structure
    const hierarchyData = {
      name: 'Categories',
      children: categories.map((category) => ({
        name: category.name,
        id: category.id,
        slug: category.slug,
        children:
          category.subcategories && category.subcategories.length > 0
            ? category.subcategories.map((sub) => ({
                name: sub.name,
                id: sub.id,
                slug: sub.slug,
              }))
            : undefined,
      })),
    };

    // Create hierarchy
    const root = d3.hierarchy(hierarchyData);

    // Use a larger horizontal spread for the tree layout
    const treeLayout = d3
      .tree()
      .size([width - 200, height - 150])
      .separation((a, b) => {
        // Increase separation based on depth and siblings
        const baseSeparation = a.parent === b.parent ? 1.5 : 2;
        // Add more space for top-level categories
        return a.depth === 1 ? baseSeparation * 1.5 : baseSeparation;
      });

    treeLayout(root);

    // Initialize all nodes as expanded
    root.descendants().forEach((d) => {
      d._children = d.children;
      if (d.depth > 0) {
        // Start with top-level categories collapsed
        d.children = null;
      }
    });

    // Toggle function
    function toggle(event, d) {
      if (d.children) {
        d._children = d.children;
        d.children = null;
      } else {
        d.children = d._children;
        d._children = null;
      }
      update(d);
    }

    // Update function
    function update(source) {
      const duration = 300;

      // Helper function for node fill color
      const getNodeFillColor = (d) => {
        if (d.depth === 0) return '#1976d2';
        if (d.depth === 1) return d._children ? '#42a5f5' : '#90caf9';
        return d._children ? '#64b5f6' : '#bbdefb';
      };

      // Helper function for cursor style
      const getCursorStyle = (d) => (d._children ? 'pointer' : 'default');

      // Recompute layout
      treeLayout(root);

      const nodes = root.descendants();
      const links = root.links();

      // Adjust vertical spacing between levels
      nodes.forEach((d) => {
        d.y = d.depth * 200; // Increased spacing from 180 to 200
      });

      // Update nodes
      const node = g.selectAll('g.node').data(nodes, (d) => d.id || d.data.id);

      // Enter new nodes
      const nodeEnter = node
        .enter()
        .append('g')
        .attr('class', 'node')
        .attr(
          'transform',
          () => `translate(${source.x0 || 0},${source.y0 || 0})`
        )
        .on('click', toggle)
        .on('keydown', function (event, d) {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            toggle(event, d);
          }
        })
        .attr('tabindex', 0)
        .attr('role', 'button')
        .attr(
          'aria-label',
          (d) =>
            `${d.data.name}, ${
              d.children || d._children ? 'expandable' : 'leaf'
            }`
        );

      // Add circles
      nodeEnter
        .append('circle')
        .attr('r', (d) => (d.depth === 0 ? 8 : d.depth === 1 ? 6 : 4))
        .style('fill', getNodeFillColor)
        .style('stroke', '#1976d2')
        .style('stroke-width', 2)
        .style('cursor', getCursorStyle);

      // Add text background for better readability
      const textGroup = nodeEnter.append('g').attr('class', 'text-group');

      // Add background rectangle
      textGroup
        .append('rect')
        .attr('class', 'text-background')
        .attr('fill', 'white')
        .attr('fill-opacity', 0.85)
        .attr('stroke', '#e0e0e0')
        .attr('stroke-width', 0.5)
        .attr('rx', 3);

      // Add labels
      textGroup
        .append('text')
        .attr('dy', (d) => (d.depth === 0 ? -15 : 20)) // Move labels below nodes to avoid overlap
        .attr('x', 0) // Center all labels horizontally
        .attr('text-anchor', 'middle') // Center text alignment
        .text((d) => {
          // Truncate long names on small screens
          const maxLength = dimensions.width < 600 ? 15 : 25;
          return d.data.name.length > maxLength
            ? d.data.name.substring(0, maxLength) + '...'
            : d.data.name;
        })
        .style('font-size', (d) =>
          d.depth === 0 ? '16px' : d.depth === 1 ? '14px' : '12px'
        )
        .style('font-weight', (d) => (d.depth === 1 ? 'bold' : 'normal'))
        .style('fill', '#333')
        .style('pointer-events', 'none');

      // Size the background rectangles based on text
      textGroup.each(function () {
        const textElement = d3.select(this).select('text');
        const bbox = textElement.node().getBBox();
        d3.select(this)
          .select('rect')
          .attr('x', bbox.x - 4)
          .attr('y', bbox.y - 2)
          .attr('width', bbox.width + 8)
          .attr('height', bbox.height + 4);
      });

      // Transition nodes to their new position
      const nodeUpdate = nodeEnter.merge(node);
      nodeUpdate
        .transition()
        .duration(duration)
        .attr('transform', (d) => `translate(${d.x},${d.y})`);

      nodeUpdate
        .select('circle')
        .style('fill', getNodeFillColor)
        .style('cursor', getCursorStyle);

      // Remove exiting nodes
      const nodeExit = node
        .exit()
        .transition()
        .duration(duration)
        .attr('transform', () => `translate(${source.x},${source.y})`)
        .remove();

      nodeExit.select('circle').attr('r', 0);
      nodeExit.select('text').style('fill-opacity', 0);

      // Update links
      const link = g
        .selectAll('path.link')
        .data(links, (d) => d.target.id || d.target.data.id);

      // Enter new links
      const linkEnter = link
        .enter()
        .insert('path', 'g')
        .attr('class', 'link')
        .attr('d', () => {
          const o = { x: source.x0 || 0, y: source.y0 || 0 };
          return diagonal(o, o);
        })
        .style('fill', 'none')
        .style('stroke', '#ccc')
        .style('stroke-width', 2);

      // Transition links to their new position
      linkEnter
        .merge(link)
        .transition()
        .duration(duration)
        .attr('d', (d) => diagonal(d.source, d.target));

      // Remove exiting links
      link
        .exit()
        .transition()
        .duration(duration)
        .attr('d', () => {
          const o = { x: source.x, y: source.y };
          return diagonal(o, o);
        })
        .remove();

      // Store old positions for transition
      nodes.forEach((d) => {
        d.x0 = d.x;
        d.y0 = d.y;
      });
    }

    // Diagonal path generator
    function diagonal(s, d) {
      return `M ${s.x} ${s.y}
              C ${s.x} ${(s.y + d.y) / 2},
                ${d.x} ${(s.y + d.y) / 2},
                ${d.x} ${d.y}`;
    }

    // Add hover effects
    g.selectAll('.node')
      .on('mouseenter', function () {
        d3.select(this).select('circle').style('stroke-width', 3);
      })
      .on('mouseleave', function () {
        d3.select(this).select('circle').style('stroke-width', 2);
      });

    // Initialize the tree
    update(root);
  }, [categories, dimensions]);

  return (
    <Box
      ref={containerRef}
      sx={{
        width: '100%',
        height: '100%',
        overflow: 'auto',
        border: '1px solid #e0e0e0',
        borderRadius: 1,
        backgroundColor: '#fafafa',
      }}
    >
      <svg
        ref={svgRef}
        width={dimensions.width}
        height={dimensions.height}
        style={{ display: 'block' }}
      />
    </Box>
  );
}

CategoryTree.propTypes = {
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      slug: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      subcategories: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
          slug: PropTypes.string.isRequired,
          name: PropTypes.string.isRequired,
        })
      ),
    })
  ).isRequired,
};
