(function () {
  // Matai Tech Chat Widget Embed Script
  var MataiChat = {
    config: {
      position: "bottom-right",
      primaryColor: "#2563eb",
      baseUrl: "https://matai-ai-agent.vercel.app",
    },

    init: function (options) {
      // Merge options with defaults
      this.config = { ...this.config, ...options };

      // Create widget container
      this.createWidget();

      // Add styles
      this.addStyles();
    },

    createWidget: function () {
      // Create bubble button
      var bubble = document.createElement("div");
      bubble.id = "matai-chat-bubble";
      bubble.innerHTML = `
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12C2 13.93 2.6 15.72 3.63 17.2L2.05 21.95L7.2 20.63C8.68 21.6 10.47 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="white"/>
        </svg>
      `;

      // Create iframe container
      var container = document.createElement("div");
      container.id = "matai-chat-container";
      container.style.display = "none";

      // Create iframe
      var iframe = document.createElement("iframe");
      iframe.id = "matai-chat-iframe";
      iframe.src = this.config.baseUrl + "/widget";
      iframe.allow = "clipboard-write";

      container.appendChild(iframe);

      // Add to page
      document.body.appendChild(bubble);
      document.body.appendChild(container);

      // Add click handler
      var self = this;
      bubble.addEventListener("click", function () {
        self.toggleChat();
      });
    },

    addStyles: function () {
      var style = document.createElement("style");
      var position = this.config.position;
      var primaryColor = this.config.primaryColor;

      // Determine position styles
      var positionStyles = "";
      if (position === "bottom-right") {
        positionStyles = "bottom: 20px; right: 20px;";
      } else if (position === "bottom-left") {
        positionStyles = "bottom: 20px; left: 20px;";
      }

      style.textContent = `
        #matai-chat-bubble {
          position: fixed;
          ${positionStyles}
          width: 60px;
          height: 60px;
          background: ${primaryColor};
          border-radius: 30px;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: all 0.3s ease;
          z-index: 999999;
        }

        #matai-chat-bubble:hover {
          transform: scale(1.1);
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
        }

        #matai-chat-container {
          position: fixed;
          ${positionStyles}
          width: 400px;
          height: 600px;
          max-width: 90vw;
          max-height: 90vh;
          background: white;
          border-radius: 16px;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
          overflow: hidden;
          z-index: 999998;
          transition: all 0.3s ease;
        }

        #matai-chat-container.open {
          display: block !important;
        }

        #matai-chat-iframe {
          width: 100%;
          height: 100%;
          border: none;
        }

        @media (max-width: 768px) {
          #matai-chat-container {
            width: 100vw;
            height: 100vh;
            max-width: 100vw;
            max-height: 100vh;
            bottom: 0 !important;
            right: 0 !important;
            left: 0 !important;
            top: 0 !important;
            border-radius: 0;
          }
        }
      `;

      document.head.appendChild(style);
    },

    toggleChat: function () {
      var container = document.getElementById("matai-chat-container");
      var bubble = document.getElementById("matai-chat-bubble");

      if (container.classList.contains("open")) {
        container.classList.remove("open");
        container.style.display = "none";
        bubble.style.display = "flex";
      } else {
        container.classList.add("open");
        container.style.display = "block";
        bubble.style.display = "none";
      }
    },
  };

  // Expose globally
  window.MataiChat = MataiChat;

  // Auto-init if data attributes present
  var script = document.currentScript;
  if (script && script.hasAttribute("data-auto-init")) {
    MataiChat.init({
      position: script.getAttribute("data-position") || "bottom-right",
      primaryColor: script.getAttribute("data-color") || "#2563eb",
    });
  }
})();
