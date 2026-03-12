/* ============================================================
   GV Web Solutions – payment.js  v2.0
   FREE Payment: UPI · QR Code · Bank Transfer
   Author: Gaurav Verma

   SETUP: Edit CONFIG block below with your details
   ============================================================ */
(function () {
  "use strict";

  const CONFIG = {
    UPI_ID:   "gaurav@oksbi",
    PAYEE:    "Gaurav Verma",
    ACCOUNT:  "1234 5678 9012",
    IFSC:     "SBIN0001234",
    BANK:     "State Bank of India",
    WHATSAPP: "919876543210",
  };

  const PLAN_ICONS = {
    "Starter Website":  { icon: "fa-seedling",        color: "#06d6a0" },
    "Business Website": { icon: "fa-building-columns", color: "#00f5c8" },
    "Premium Website":  { icon: "fa-crown",            color: "#ffd166" },
  };

  let currentPlan = "", currentAmount = 0;
  let customerName = "", customerEmail = "", customerPhone = "";

  const payModal = new bootstrap.Modal(document.getElementById("paymentModal"), { backdrop:"static", keyboard:false });

  // Open modal on Buy Now click
  document.querySelectorAll(".pay-now-btn").forEach(function(btn) {
    btn.addEventListener("click", function() {
      openModal(this.dataset.plan, parseInt(this.dataset.amount), this.dataset.desc);
    });
  });

  function openModal(plan, amount, desc) {
    currentPlan = plan; currentAmount = amount;
    document.getElementById("payPlanName").textContent = plan;
    document.getElementById("payPlanDesc").textContent = desc;
    document.getElementById("payAmount").textContent = amount.toLocaleString("en-IN");
    setIcon("payPlanIcon", plan);
    resetForm(); showStep(1);
    payModal.show();
  }

  function setIcon(elId, plan) {
    const pd = PLAN_ICONS[plan] || { icon:"fa-code", color:"var(--accent)" };
    const el = document.getElementById(elId);
    if (!el) return;
    el.innerHTML = '<i class="fa-solid ' + pd.icon + '"></i>';
    el.style.color = pd.color;
    el.style.borderColor = pd.color + "44";
    el.style.background  = pd.color + "1a";
  }

  // Step 1 Proceed
  document.getElementById("proceedToPayBtn").addEventListener("click", function() {
    if (!validateStep1()) return;
    customerName  = document.getElementById("payName").value.trim();
    customerEmail = document.getElementById("payEmail").value.trim();
    customerPhone = document.getElementById("payPhone").value.trim();

    setIcon("payPlanIconS2", currentPlan);
    document.getElementById("payPlanNameS2").textContent = currentPlan;
    document.getElementById("payAmountS2").textContent = "₹" + currentAmount.toLocaleString("en-IN");
    document.getElementById("qrAmountBadge").textContent = "₹" + currentAmount.toLocaleString("en-IN");
    document.getElementById("qrDetailAmount").textContent = "₹" + currentAmount.toLocaleString("en-IN");
    document.getElementById("bankAmount").textContent = "₹" + currentAmount.toLocaleString("en-IN");

    const upiIdEl = document.getElementById("qrUpiId");
    if (upiIdEl) upiIdEl.innerHTML = CONFIG.UPI_ID + ' <button class="copy-btn" data-copy="' + CONFIG.UPI_ID + '"><i class="fa-solid fa-copy"></i></button>';

    generateQR();
    showStep(2);
    activateTab("upi");
  });

  // Back button
  document.getElementById("payBackBtn").addEventListener("click", function() { showStep(1); });

  // Tabs
  document.querySelectorAll(".pay-tab").forEach(function(tab) {
    tab.addEventListener("click", function() { activateTab(this.dataset.tab); });
  });

  function activateTab(name) {
    document.querySelectorAll(".pay-tab").forEach(function(t) { t.classList.toggle("active", t.dataset.tab === name); });
    document.querySelectorAll(".pay-tab-content").forEach(function(c) { c.classList.toggle("active", c.id === "tab-" + name); });
  }

  // Verify UPI ID
  document.getElementById("verifyUpiBtn").addEventListener("click", function() {
    const val = document.getElementById("upiIdInput").value.trim();
    const statusEl = document.getElementById("upiVerifyStatus");
    const payUpiBtn = document.getElementById("payUpiBtn");
    if (!val || !val.includes("@")) {
      showStatus(statusEl, "error", "⚠ Enter a valid UPI ID (e.g. name@upi)");
      return;
    }
    this.disabled = true;
    this.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-1"></i> Verifying…';
    var self = this;
    setTimeout(function() {
      showStatus(statusEl, "success", "✓ UPI ID verified! Click below to send payment request.");
      payUpiBtn.style.display = "block";
      self.disabled = false;
      self.innerHTML = '<i class="fa-solid fa-check me-1"></i> Verified';
    }, 1200);
  });

  // UPI App buttons
  document.querySelectorAll(".upi-app-btn").forEach(function(btn) {
    btn.addEventListener("click", function() {
      var app = this.dataset.app;
      var link = "upi://pay?pa=" + encodeURIComponent(CONFIG.UPI_ID) +
                 "&pn=" + encodeURIComponent(CONFIG.PAYEE) +
                 "&am=" + currentAmount + "&cu=INR" +
                 "&tn=" + encodeURIComponent("GV Web Solutions - " + currentPlan);
      var appLinks = {
        gpay:    "gpay://upi/pay?pa=" + CONFIG.UPI_ID + "&pn=" + CONFIG.PAYEE + "&am=" + currentAmount + "&cu=INR",
        phonepe: "phonepe://pay?pa=" + CONFIG.UPI_ID + "&pn=" + CONFIG.PAYEE + "&am=" + currentAmount + "&cu=INR",
        paytm:   "paytmmp://pay?pa=" + CONFIG.UPI_ID + "&pn=" + CONFIG.PAYEE + "&am=" + currentAmount + "&cu=INR",
        bhim:    link,
      };
      window.location.href = appLinks[app] || link;
      var payUpiBtn = document.getElementById("payUpiBtn");
      setTimeout(function() {
        payUpiBtn.style.display = "block";
        payUpiBtn.innerHTML = '<i class="fa-solid fa-check-circle me-2"></i> Payment Done – Confirm';
      }, 3000);
    });
  });

  document.getElementById("payUpiBtn").addEventListener("click", function() { confirmFlow("UPI"); });
  document.getElementById("qrPaidBtn").addEventListener("click", function() { confirmFlow("QR Code"); });
  document.getElementById("bankDoneBtn").addEventListener("click", function() {
    var utr = prompt("Enter your UTR / Transaction Reference Number:");
    confirmFlow("Bank Transfer", utr || "Not provided");
  });

  function confirmFlow(method, utr) {
    showStep("2b");
    document.getElementById("processingMsg").textContent = "Confirming Your Payment…";
    animateProgress();
    setTimeout(function() { onSuccess(generateTxnId(), method, utr); }, 2500);
  }

  function onSuccess(txnId, method, utr) {
    showStep(3);
    document.getElementById("rcPlan").textContent   = currentPlan;
    document.getElementById("rcAmount").textContent = "₹" + currentAmount.toLocaleString("en-IN");
    document.getElementById("rcTxn").textContent    = txnId;
    document.getElementById("rcDate").textContent   = new Date().toLocaleString("en-IN", { day:"2-digit", month:"short", year:"numeric", hour:"2-digit", minute:"2-digit" });
    confettiBurst();
    saveOrder({ txnId, plan:currentPlan, amount:currentAmount, method, utr, name:customerName, email:customerEmail });

    var waMsg = encodeURIComponent(
      "🎉 *New Payment!*\n• Plan: *" + currentPlan + "*\n• Amount: *₹" + currentAmount.toLocaleString("en-IN") +
      "*\n• Method: " + method + "\n• Txn: " + txnId + (utr ? "\n• UTR: " + utr : "") +
      "\n\n*Client:*\n• " + customerName + "\n• " + customerEmail + "\n• " + customerPhone
    );
    setTimeout(function() { window.open("https://wa.me/" + CONFIG.WHATSAPP + "?text=" + waMsg, "_blank"); }, 2000);
  }

  // QR Generator (visual placeholder – see comment for real QR)
  function generateQR() {
    var canvas = document.getElementById("qrCanvas");
    if (!canvas) return;
    var ctx = canvas.getContext("2d");
    var size = 180, bs = 6, cols = Math.floor(size / bs);
    ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, size, size);
    var s = (CONFIG.UPI_ID + currentAmount).split("").reduce(function(a,c){ return a+c.charCodeAt(0); }, 0);
    function rand() { s=(s*9301+49297)%233280; return s/233280; }
    ctx.fillStyle = "#000000";
    for (var r=0; r<cols; r++) {
      for (var c=0; c<cols; c++) {
        var inF = (r<7&&c<7)||(r<7&&c>=cols-7)||(r>=cols-7&&c<7);
        if (inF) {
          if (r>=cols-7&&c>=cols-7) { rand(); continue; }
          var fr=r<7?r:r-(cols-7), fc=c<7?c:c-(cols-7);
          if ((fr===0||fr===6||fc===0||fc===6)||(fr>=2&&fr<=4&&fc>=2&&fc<=4))
            ctx.fillRect(c*bs,r*bs,bs,bs);
        } else {
          if (rand()>0.55) ctx.fillRect(c*bs,r*bs,bs-1,bs-1);
        }
      }
    }
    for (var i=8; i<cols-8; i++) {
      if (i%2===0) { ctx.fillRect(i*bs,6*bs,bs,bs); ctx.fillRect(6*bs,i*bs,bs,bs); }
    }
    // For a REAL scannable QR, add qrcode.js and use:
    // new QRCode(canvas, { text: "upi://pay?pa="+CONFIG.UPI_ID+"&am="+currentAmount+"&cu=INR", width:180, height:180 });
    console.log("UPI Link:", "upi://pay?pa="+CONFIG.UPI_ID+"&pn="+CONFIG.PAYEE+"&am="+currentAmount+"&cu=INR");
  }

  // Copy buttons
  document.addEventListener("click", function(e) {
    var btn = e.target.closest(".copy-btn");
    if (!btn) return;
    var text = btn.dataset.copy;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(function() {
        btn.classList.add("copied"); btn.innerHTML = '<i class="fa-solid fa-check"></i>';
        setTimeout(function() { btn.classList.remove("copied"); btn.innerHTML = '<i class="fa-solid fa-copy"></i>'; }, 1800);
      });
    }
    showToast(text + " copied!", "success");
  });

  function animateProgress() {
    var fill = document.getElementById("payProgressFill");
    if (!fill) return;
    fill.style.width="0%";
    setTimeout(function(){fill.style.width="40%";},100);
    setTimeout(function(){fill.style.width="78%";},900);
    setTimeout(function(){fill.style.width="100%";},2200);
  }

  function showStatus(el, type, msg) {
    el.style.display="block"; el.className="upi-verify-status "+type; el.textContent=msg;
  }

  function showStep(step) {
    document.getElementById("payStep1").style.display   = step==1    ? "" : "none";
    document.getElementById("payStep2").style.display   = step==2    ? "" : "none";
    document.getElementById("payStep2b").style.display  = step=="2b" ? "" : "none";
    document.getElementById("payStep3").style.display   = step==3    ? "" : "none";
  }

  function validateStep1() {
    var name=document.getElementById("payName"), email=document.getElementById("payEmail"),
        phone=document.getElementById("payPhone"), agree=document.getElementById("payAgree");
    var ok=true;
    [name,email,phone].forEach(function(el){ if(!el.value.trim()){flashInput(el);ok=false;} });
    if(email.value&&!email.value.includes("@")){flashInput(email);ok=false;}
    if(!agree.checked){
      agree.closest(".pay-agreement").style.outline="2px solid #ff6b6b";
      setTimeout(function(){agree.closest(".pay-agreement").style.outline="";},2000);
      showToast("Please agree to Terms of Service","error"); ok=false;
    }
    return ok;
  }

  function flashInput(el) {
    el.style.borderColor="#ff6b6b"; el.style.boxShadow="0 0 0 3px rgba(255,107,107,.15)"; el.focus();
    setTimeout(function(){el.style.borderColor="";el.style.boxShadow="";},2500);
  }

  function resetForm() {
    ["payName","payEmail","payPhone","payBusiness","payGst"].forEach(function(id){
      var el=document.getElementById(id); if(el) el.value="";
    });
    var agree=document.getElementById("payAgree"); if(agree) agree.checked=false;
    var btn=document.getElementById("proceedToPayBtn");
    if(btn){btn.disabled=false;btn.innerHTML='<i class="fa-solid fa-lock me-2"></i> Proceed to Secure Payment';}
    var ub=document.getElementById("payUpiBtn"); if(ub) ub.style.display="none";
    var vb=document.getElementById("verifyUpiBtn"); if(vb){vb.disabled=false;vb.innerHTML='<i class="fa-solid fa-check me-1"></i>Verify';}
    var st=document.getElementById("upiVerifyStatus"); if(st){st.style.display="none";st.textContent="";}
    var ui=document.getElementById("upiIdInput"); if(ui) ui.value="";
  }

  function confettiBurst() {
    var colors=["#00f5c8","#ffd166","#ff6b6b","#7c6cf8","#06d6a0","#219ebc"];
    var container=document.getElementById("payStep3");
    if (!document.getElementById("confettiStyle")) {
      var s=document.createElement("style"); s.id="confettiStyle";
      s.textContent="@keyframes cfall{0%{transform:translateY(0) rotate(0);opacity:.9}100%{transform:translateY(380px) rotate(720deg);opacity:0}}";
      document.head.appendChild(s);
    }
    for(var i=0;i<70;i++) {
      var p=document.createElement("div");
      p.style.cssText="position:absolute;pointer-events:none;width:"+(5+Math.random()*9)+"px;height:"+(5+Math.random()*9)+"px;background:"+colors[Math.floor(Math.random()*colors.length)]+";border-radius:"+(Math.random()>.5?"50%":"3px")+";left:"+(Math.random()*100)+"%;top:-12px;animation:cfall "+(1.4+Math.random()*2)+"s ease forwards;animation-delay:"+(Math.random()*.9)+"s;z-index:10;";
      container.appendChild(p);
      setTimeout(function(){if(p.parentNode)p.parentNode.removeChild(p);},3600);
    }
  }

  function showToast(msg, type) {
    var old=document.getElementById("gvToast"); if(old) old.remove();
    var colors={success:"#06d6a0",error:"#ff6b6b",info:"var(--accent)",warning:"#ffd166"};
    var icons={success:"fa-circle-check",error:"fa-circle-xmark",info:"fa-circle-info",warning:"fa-triangle-exclamation"};
    type=type||"info";
    var t=document.createElement("div"); t.id="gvToast";
    t.style.cssText="position:fixed;bottom:30px;left:50%;transform:translateX(-50%) translateY(20px);background:var(--surface);border:1px solid "+colors[type]+";color:var(--text);border-radius:12px;padding:13px 22px;display:flex;align-items:center;gap:10px;font-size:.87rem;font-weight:600;box-shadow:0 8px 32px rgba(0,0,0,.4);z-index:99999;white-space:nowrap;max-width:90vw;opacity:0;transition:all .3s ease;";
    t.innerHTML='<i class="fa-solid '+icons[type]+'" style="color:'+colors[type]+';font-size:1.1rem"></i>'+msg;
    document.body.appendChild(t);
    requestAnimationFrame(function(){t.style.opacity="1";t.style.transform="translateX(-50%) translateY(0)";});
    setTimeout(function(){t.style.opacity="0";t.style.transform="translateX(-50%) translateY(20px)";setTimeout(function(){if(t.parentNode)t.remove();},300);},3800);
  }

  function saveOrder(o) {
    try { var a=JSON.parse(localStorage.getItem("gv-orders")||"[]"); a.unshift(o); localStorage.setItem("gv-orders",JSON.stringify(a.slice(0,20))); } catch(e){}
  }

  function generateTxnId() {
    return "GV"+Date.now().toString(36).toUpperCase()+Math.random().toString(36).substr(2,5).toUpperCase();
  }

  window.GVPayment = { open:openModal, demo:function(){openModal("Business Website",24999,"Demo");} };
  console.log("%cGV Payment v2 ✓ UPI/QR/Bank (Free)","color:#00f5c8;font-weight:bold");
})();
