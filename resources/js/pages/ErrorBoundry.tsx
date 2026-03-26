import React, { useEffect, useRef, useState } from "react";

const StarfieldCanvas = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const stars = [];
    const starCount = 200;

    class Star {
      constructor() {
        this.reset();
      }

      reset() {
        this.x = Math.random() * canvas.width;
        this.y = Math.random() * canvas.height;
        this.size = Math.random() * 2;
        this.speedX = (Math.random() - 0.5) * 0.2;
        this.speedY = (Math.random() - 0.5) * 0.2;
        this.opacity = Math.random();
        this.fadeSpeed = Math.random() * 0.02 + 0.005;
        this.fadeDirection = Math.random() > 0.5 ? 1 : -1;
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        this.opacity += this.fadeSpeed * this.fadeDirection;
        if (this.opacity <= 0 || this.opacity >= 1) {
          this.fadeDirection *= -1;
        }

        if (this.x < 0 || this.x > canvas.width || this.y < 0 || this.y > canvas.height) {
          this.reset();
        }
      }

      draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${this.opacity})`;
        ctx.fill();
      }
    }

    for (let i = 0; i < starCount; i++) {
      stars.push(new Star());
    }

    let animationId;
    function animate() {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      stars.forEach((star) => {
        star.update();
        star.draw();
      });

      animationId = requestAnimationFrame(animate);
    }

    animate();

    const handleResize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed top-0 left-0 w-full h-full"
      style={{ zIndex: 0 }}
    />
  );
};

const ErrorPage = ({ errorMessage, onRetry }) => {
  const [inputValue, setInputValue] = useState('');
  const textareaRef = useRef(null);

  const handleSubmit = () => {
    if (inputValue.trim()) {
      window.location.href = `/new?s=${encodeURIComponent(inputValue)}`;
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleInput = (e) => {
    setInputValue(e.target.value);
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 150) + 'px';
    }
  };

  return (
    <div className="min-h-screen bg-black text-white flex justify-center items-center overflow-hidden relative">
      <StarfieldCanvas />

      <div className="relative z-10 max-w-2xl w-11/12 p-10 text-center">
        <div
          className="text-8xl md:text-9xl font-bold mb-4"
          style={{
            background: 'linear-gradient(135deg, #fff 0%, #888 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text',
            letterSpacing: '-2px'
          }}
        >
          {errorMessage ? 'Error' : '404'}
        </div>

        <h1 className="text-2xl md:text-3xl font-semibold mb-3 text-white">
          {errorMessage ? 'Something Went Wrong' : 'Page Not Found'}
        </h1>

        <p className="text-base md:text-lg text-gray-400 mb-10 leading-relaxed">
          {errorMessage
            ? `An unexpected error occurred: ${errorMessage}. You can try reloading or ask Kwatia AI for help.`
            : 'The page you are looking for does not exist, but you could try asking Kwatia AI or just speak what\'s on your mind.'
          }
        </p>

        {errorMessage && onRetry && (
          <button
            onClick={onRetry}
            className="mb-6 bg-white text-black px-6 py-3 rounded-xl font-medium hover:bg-gray-200 transition-all"
          >
            Try Again
          </button>
        )}

        <div className="relative">
          <div
            className="bg- bg-opacity-5 backdrop-blur-md border border-white border-opacity-10 rounded-2xl p-2 flex gap-2 transition-all duration-300"
            style={{
              boxShadow: inputValue ? '0 0 0 3px rgba(255, 255, 255, 0.1)' : 'none'
            }}
          >
            <textarea
              ref={textareaRef}
              value={inputValue}
              onChange={handleInput}
              onKeyPress={handleKeyPress}
              placeholder="Ask Kwatia AI"
              rows="1"
              className="flex-1 bg-body border-none text-whi text-base px-4 py-3 resize-none outline-none min-h-[50px] max-h-[150px]"
              style={{ fontFamily: 'inherit' }}
            />
            <button
              onClick={handleSubmit}
              className="absolute right-5 bottom-5 bg-white text-black border-none rounded-xl w-11 h-11 cursor-pointer transition-all duration-200 flex items-center justify-center hover:bg-gray-200 hover:-translate-y-0.5 active:translate-y-0"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                <path d="M22 2L11 13"></path>
                <path d="M22 2L15 22L11 13L2 9L22 2Z"></path>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error: error.message };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught by ErrorBoundary:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      return <ErrorPage errorMessage={this.state.error} onRetry={this.handleRetry} />;
    }

    return this.props.children;
  }
}
export default ErrorBoundary;
