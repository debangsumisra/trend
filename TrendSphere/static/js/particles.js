document.addEventListener('DOMContentLoaded', function() {
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    
    // Configuration for the 3D particle effect
    const config = {
        particleCount: 150,
        connectionDistance: 120,
        maxSpeed: 0.35,
        colors: ['#FF3385', '#6d8aff', '#5a43ff', '#43c9ff', '#43ffd9'],
        particleSizeRange: [0.5, 3],
        pulseSpeed: 0.02,
        connectionOpacity: 0.15,
        mouseMoveStrength: 0.03,
        mouseCircleRadius: 180,
        mouseCircleOpacity: 0.05
    };
    
    let mouseX = 0;
    let mouseY = 0;
    let particles = [];
    let animationFrame;
    
    // Track mouse position
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    
    // Touch movement for mobile
    window.addEventListener('touchmove', (e) => {
        if (e.touches.length > 0) {
            mouseX = e.touches[0].clientX;
            mouseY = e.touches[0].clientY;
        }
    });
    
    // Resize canvas when window size changes
    window.addEventListener('resize', () => {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        createParticles();
    });
    
    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.z = Math.random() * 10;
            this.size = (Math.random() * (config.particleSizeRange[1] - config.particleSizeRange[0]) + config.particleSizeRange[0]) * (10 / (this.z + 5));
            this.color = config.colors[Math.floor(Math.random() * config.colors.length)];
            this.vx = (Math.random() - 0.5) * config.maxSpeed;
            this.vy = (Math.random() - 0.5) * config.maxSpeed;
            this.vz = (Math.random() - 0.5) * 0.1;
            this.pulse = Math.random() * Math.PI * 2;
        }
        
        update() {
            this.x += this.vx;
            this.y += this.vy;
            this.z += this.vz;
            
            if (this.z < 0 || this.z > 10) {
                this.vz = -this.vz;
            }
            
            if (this.x < 0) this.x = canvas.width;
            if (this.x > canvas.width) this.x = 0;
            if (this.y < 0) this.y = canvas.height;
            if (this.y > canvas.height) this.y = 0;
            
            this.pulse += config.pulseSpeed;
            this.displaySize = this.size * (Math.sin(this.pulse) * 0.2 + 0.8) * (10 / (this.z + 5));
            
            const dx = mouseX - this.x;
            const dy = mouseY - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist < config.mouseCircleRadius) {
                this.x += dx * config.mouseMoveStrength;
                this.y += dy * config.mouseMoveStrength;
            }
        }
        
        draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.displaySize, 0, Math.PI * 2);
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }
    
    function createParticles() {
        particles = [];
        for (let i = 0; i < config.particleCount; i++) {
            particles.push(new Particle());
        }
    }
    
    function drawConnections() {
        ctx.lineWidth = 0.3;
        
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const p1 = particles[i];
                const p2 = particles[j];
                
                const dx = p1.x - p2.x;
                const dy = p1.y - p2.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < config.connectionDistance) {
                    const opacity = (1 - distance / config.connectionDistance) * config.connectionOpacity * 
                                    (1 - Math.abs(p1.z - p2.z) / 10);
                    
                    ctx.beginPath();
                    ctx.moveTo(p1.x, p1.y);
                    ctx.lineTo(p2.x, p2.y);
                    
                    const gradient = ctx.createLinearGradient(p1.x, p1.y, p2.x, p2.y);
                    gradient.addColorStop(0, p1.color.replace(')', `, ${opacity})`).replace('rgb', 'rgba'));
                    gradient.addColorStop(1, p2.color.replace(')', `, ${opacity})`).replace('rgb', 'rgba'));
                    
                    ctx.strokeStyle = gradient;
                    ctx.stroke();
                }
            }
        }
    }
    
    function drawMouseCircle() {
        if (mouseX > 0 && mouseY > 0) {
            ctx.beginPath();
            ctx.arc(mouseX, mouseY, config.mouseCircleRadius, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(109, 138, 255, ${config.mouseCircleOpacity})`;
            ctx.fill();
        }
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        drawMouseCircle();
        particles.sort((a, b) => b.z - a.z);
        drawConnections();
        
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });
        
        animationFrame = requestAnimationFrame(animate);
    }
    
    function addDynamicParticles() {
        if (mouseX > 0 && mouseY > 0 && Math.random() > 0.95) {
            const p = new Particle();
            p.x = mouseX;
            p.y = mouseY;
            particles.push(p);
            
            if (particles.length > config.particleCount) {
                particles.shift();
            }
        }
        
        setTimeout(addDynamicParticles, 100);
    }
    
    function init() {
        createParticles();
        animate();
        addDynamicParticles();
    }
    
    init();
    
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animationFrame);
        } else {
            animate();
        }
    });
}); 