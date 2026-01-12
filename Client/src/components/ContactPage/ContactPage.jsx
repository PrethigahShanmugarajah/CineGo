// CineGo / Client / src / components / ContactPage / ContactPage.jsx
import { useState } from "react";
import { toast } from "react-toastify";
import {
  Mail,
  MapPin,
  MessageCircle,
  Phone,
  Popcorn,
  Send,
  Ticket,
} from "lucide-react";

const ContactPage = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "phone") {
      const digits = value.replace(/\D/g, "").slice(0, 10);
      setFormData((prev) => ({ ...prev, phone: digits }));
      return;
    }

    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!formData.phone || formData.phone.length !== 10) {
      toast.error("Please enter a valid 10-digit phone number");
      console.warn("Submit blocked - invalid phone:", formData.phone);
      return;
    }

    const whatsappMessage = `Name": ${encodeURIComponent(
      formData.name
    )}%0AEmail: ${encodeURIComponent(
      formData.email
    )}%0APhone: ${encodeURIComponent(
      formData.phone
    )}%0ASubject: ${encodeURIComponent(
      formData.subject
    )}%0AMessage: ${encodeURIComponent(formData.message)}`;

    window.open(`https://wa.me/0771234567=${whatsappMessage}`, "_blank");

    setFormData({
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    });
  };

  return (
    <div className="min-h-screen pt-15 bg-black text-white py-8 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
      <div className="absolute top-0 left-0 w-full h-48 bg-linear-to-b from-purple-900/20 to-transparent"></div>
      <div className="absolute top-40 right-10 w-32 h-32 bg-purple-500/10 rounded-full filter blur-xl"></div>
      <div className="absolute bottom-20 left-8 w-24 h-24 bg-purple-700/10 rounded-full filter blur-xl"></div>

      {/* -------- Film Strip Effect -------- */}
      <div className="absolute top-0 left-0 w-full h-4 flex gap-8">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="w-8 h-4 bg-gray-800"></div>
        ))}
      </div>

      <div className="absolute top-0 left-0 w-full h-4 flex gap-8">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="w-8 h-4 bg-gray-800"></div>
        ))}
      </div>

      <div className="max-w-6xl pt-20 mx-auto relative z-10">
        <div className="text-center font-[pacifico] mb-12">
          <div className="inline-flex items-center justify-center mb-4">
            <h1 className="text-4xl md:text-6xl font-bold">
              <span className="text-purple-400">Contact</span>{" "}
              <span className="text-white">Us</span>
            </h1>
          </div>

          <p className="text-xl text-gray-300 max-w-3xl mx-auto mt-4">
            Have questions about movie bookings or special events? Our team is
            here to help you.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="relative">
            <div className="absolute -inset-2 bg-linear-to-r from-purple-600 to-purple-800 rounded-2xl blur-md opacity-50" />
            <div className="relative bg-gray-800 rounded-2xl p-6 shadow-2xl border border-purple-500/30">
              <div className="absolute -top-3 left-6 bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center">
                <Ticket className="h-4 w-4 mr-1" />
                Booking Support
              </div>

              <h2 className="text-2xl font-bold mb-6 font-[pacifico] text-purple-400 flex items-center pt-2">
                <MessageCircle className="mr-3" />
                Send us a Message
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="name"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Full Name <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 bg-gray-700 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-transparent transition-all duration-300 outline-none"
                      placeholder="Full Name"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="email"
                      className="block text-sm font-medium text-gray-300 mb-2"
                    >
                      Email Address <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      className="w-full px-4 py-2.5 bg-gray-700 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-transparent transition-all duration-300 outline-none"
                      placeholder="Email"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Phone Number <span className="text-red-500">*</span>
                  </label>

                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    maxLength={10}
                    title="Phone Number"
                    className="w-full px-4 py-2.5 bg-gray-700 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-transparent transition-all duration-300 outline-none"
                    placeholder="Phone Number"
                  />
                </div>

                <div>
                  <label
                    htmlFor="subject"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Subject <span className="text-red-500">*</span>
                  </label>

                  <select
                    name="subject"
                    id="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-2.5 bg-gray-700 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-transparent transition-all duration-300 outline-none"
                  >
                    <option value="">Select a subject</option>
                    <option value="Ticket Booking">Ticket Booking</option>
                    <option value="Group Events">Group Events</option>
                    <option value="Membership Inquiry">
                      Membership Inquiry
                    </option>
                    <option value="Technical Issue">Technical Issue</option>
                    <option value="Refund">Refund</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="message"
                    className="block text-sm font-medium text-gray-300 mb-2"
                  >
                    Message <span className="text-red-500">*</span>
                  </label>

                  <textarea
                    name="message"
                    id="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    rows="4"
                    className="w-full px-4 py-2.5 bg-gray-700 rounded-lg focus:ring-1 focus:ring-purple-500 focus:border-transparent transition-all duration-300 outline-none resize-none"
                    placeholder="Please describe your inquiry in details..."
                  ></textarea>
                </div>

                <button
                  type="submit"
                  className="w-full bg-linear-to-r from-purple-600 to-purple-800 text-white py-3 px-6 rounded-full font-bold flex items-center justify-center transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl cursor-pointer hover:to-purple-900 group"
                >
                  Send via WhatsApp
                  <Send className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </form>
            </div>
          </div>

          <div className="space-y-6">
            <div className="relative">
              <div className="absolute -inset-2 bg-linear-to-r from-purple-600 to-purple-800 rounded-2xl blur-md opacity-50"></div>
              <div className="relative bg-gray-800 rounded-2xl p-6 shadow-2xl border border-purple-500/30">
                <div className="absolute -top-3 left-6 bg-purple-600 text-white px-4 py-1 rounded-full text-sm font-bold flex items-center">
                  <Popcorn className="h-4 w-4 mr-1" /> Cinema Info
                </div>
                <h2 className="text-2xl font-bold mb-6 font-[pacifico] text-purple-400 flex items-center pt-2">
                  Contact Information
                </h2>

                <div className="space-y-5">
                  <div className="flex items-start group">
                    <div className="bg-purple-600 p-2 rounded-full mr-4 transition-transform">
                      <Phone className="h-5 w-5" />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-1">
                        Booking Hotline
                      </h3>

                      <p className="text-gray-300">+94 771234567</p>
                    </div>
                  </div>

                  <div className="flex items-start group">
                    <div className="bg-purple-600 p-2 rounded-full mr-4 transition-transform">
                      <Mail className="h-5 w-5" />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-1">
                        Email Address
                      </h3>

                      <p className="text-gray-300">cinego@cinego.com</p>
                      <p className="text-gray-300">cinego@example.com</p>
                    </div>
                  </div>

                  <div className="flex items-start group">
                    <div className="bg-purple-600 p-2 rounded-full mr-4 transition-transform">
                      <MapPin className="h-5 w-5" />
                    </div>

                    <div>
                      <h3 className="text-lg font-semibold mb-1">Lorem</h3>

                      <p className="text-gray-300">
                        Lorem ipsum dolor sit amet, consectetur adipisicing
                        elit.
                      </p>
                      <p className="text-gray-300">
                        Lorem ipsum dolor sit amet.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative">
              <div className="absolute -inset-2 bg-linear-to-r from-amber-600 to-amber-800 rounded-2xl blur-lg opacity-50"></div>
              <div className="relative bg-gray-800 rounded-2xl p-5 shadow-2xl border border-amber-500/30">
                <h3 className="text-lg font-bold mb-3 text-amber-400 flex items-center">
                  <Phone className="h-5 w-5 mr-2" />
                  Lorem ipsum dolor sit.
                </h3>

                <p className="text-gray-300 text-sm mb-3">
                  Lorem ipsum dolor sit amet consectetur adipisicing elit.
                  Doloremque, ipsam!
                </p>

                <div className="flex items-center">
                  <div className="bg-amber-600 text-white text-sm font-bold px-3 py-1 rounded-full">
                    Hotline: +94 777654321
                  </div>
                  <span className="ml-3 text-xs text-amber-400">
                    Available during showtimes
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ContactPage;
