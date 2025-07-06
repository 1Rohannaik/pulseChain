import { Link } from "react-router-dom";
import { FaRegHospital, FaQrcode, FaFileUpload } from "react-icons/fa";
import { FiArrowRight } from "react-icons/fi";
import Chatbot from "../chat/Chatbot";

function LandingPage() {
  return (
    <div>
      {/* Hero section */}
      <section className="bg-gradient-to-br from-primary-500 to-primary-700 text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
                Instant Medical Access When Every Second Counts.
              </h1>
              <p className="text-lg md:text-xl mb-8 text-primary-100">
                PulseChain provides emergency medical professionals with
                immediate access to your critical health information through
                secure, QR-based technology.
              </p>
              <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <Link
                  to="/signup"
                  className="btn bg-white text-primary-700 hover:bg-primary-50 transition-colors duration-300"
                >
                  Create Profile
                </Link>
                <Link
                  to="/scan"
                  className="btn bg-primary-800 text-white hover:bg-primary-900 transition-colors duration-300"
                >
                  Scan QR Code
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 flex justify-center">
              <div className="relative w-full max-w-md">
                <div className="absolute inset-0 bg-white opacity-10 rounded-lg transform -rotate-6"></div>
                <div className="relative bg-white p-6 rounded-lg shadow-xl">
                  <div className="flex justify-between items-center mb-4">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-primary-500 flex items-center justify-center">
                        <FaQrcode className="text-white" />
                      </div>
                      <div className="ml-2">
                        <h3 className="font-bold text-primary-700">
                          Emergency Card
                        </h3>
                      </div>
                    </div>
                    <div className="text-sm text-right text-neutral-500">
                      ID: PCT-2025
                    </div>
                  </div>
                  <div className="p-4 bg-neutral-100 rounded-lg mb-4">
                    <div className="flex justify-center">
                      <div className="w-32 h-32 bg-white p-2 rounded-lg shadow-sm">
                        <div className="w-full h-full border-2 border-primary-500 rounded flex items-center justify-center">
                          <FaQrcode className="text-4xl text-primary-500" />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-3 text-neutral-900">
                    <div className="flex justify-between">
                      <div className="font-semibold">Name:</div>
                      <div>John Smith</div>
                    </div>
                    <div className="flex justify-between">
                      <div className="font-semibold">Blood Type:</div>
                      <div className="text-danger-600 font-bold">O+</div>
                    </div>
                    <div className="flex justify-between">
                      <div className="font-semibold">Allergies:</div>
                      <div className="text-danger-600 font-bold">
                        Penicillin
                      </div>
                    </div>
                    <div className="flex justify-between">
                      <div className="font-semibold">Emergency Contact:</div>
                      <div>555-123-4567</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works section */}
      <section className="py-16 bg-white dark:bg-neutral-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
              How PulseChain Works
            </h2>
            <p className="max-w-2xl mx-auto text-neutral-600 dark:text-neutral-400">
              Three simple steps to ensure your critical medical information is
              always available in an emergency.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="card flex flex-col items-center text-center p-6 transition-all duration-300 hover:transform hover:translate-y-[-5px]">
              <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center mb-4">
                <FaRegHospital className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-neutral-900 dark:text-white">
                Create Profile
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Sign up and create your medical profile with essential
                information like allergies, medications, and emergency contacts.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card flex flex-col items-center text-center p-6 transition-all duration-300 hover:transform hover:translate-y-[-5px]">
              <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center mb-4">
                <FaFileUpload className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-neutral-900 dark:text-white">
                Upload Documents
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Securely upload and categorize your medical documents. Our AI
                helps organize them by type.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card flex flex-col items-center text-center p-6 transition-all duration-300 hover:transform hover:translate-y-[-5px]">
              <div className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900 flex items-center justify-center mb-4">
                <FaQrcode className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-bold mb-2 text-neutral-900 dark:text-white">
                Emergency Access
              </h3>
              <p className="text-neutral-600 dark:text-neutral-400">
                Healthcare professionals can instantly access your critical
                information by scanning your unique QR code.
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <Link
              to="/signup"
              className="btn btn-primary inline-flex items-center"
            >
              Get Started <FiArrowRight className="ml-2" />
            </Link>
          </div>
        </div>
        <Chatbot />
      </section>

      {/* Testimonials section */}
      <section className="py-16 bg-neutral-50 dark:bg-neutral-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-neutral-900 dark:text-white mb-4">
              Life-Saving Impact
            </h2>
            <p className="max-w-2xl mx-auto text-neutral-600 dark:text-neutral-400">
              See how PulseChain has made a difference in emergency situations.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Testimonial 1 */}
            <div className="card p-6 bg-white dark:bg-neutral-700 rounded-lg shadow">
              <div className="mb-4">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
                    <span className="text-primary-600 dark:text-primary-300 font-bold">
                      DR
                    </span>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-lg font-semibold text-neutral-900 dark:text-white">
                      Dr. Robert Chen
                    </h4>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Emergency Physician
                    </p>
                  </div>
                </div>
                <p className="text-neutral-700 dark:text-neutral-300">
                  "PulseChain gave us immediate access to a patient's severe
                  allergy history during a critical situation. It made all the
                  difference in our treatment approach."
                </p>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="card p-6 bg-white dark:bg-neutral-700 rounded-lg shadow">
              <div className="mb-4">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
                    <span className="text-primary-600 dark:text-primary-300 font-bold">
                      EW
                    </span>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-lg font-semibold text-neutral-900 dark:text-white">
                      Emily Wilson
                    </h4>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Patient
                    </p>
                  </div>
                </div>
                <p className="text-neutral-700 dark:text-neutral-300">
                  "I have a complex medical history. Having my information
                  instantly available through PulseChain gives me peace of mind
                  whenever I travel."
                </p>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="card p-6 bg-white dark:bg-neutral-700 rounded-lg shadow">
              <div className="mb-4">
                <div className="flex items-center mb-4">
                  <div className="h-10 w-10 rounded-full bg-primary-100 dark:bg-primary-800 flex items-center justify-center">
                    <span className="text-primary-600 dark:text-primary-300 font-bold">
                      JS
                    </span>
                  </div>
                  <div className="ml-3">
                    <h4 className="text-lg font-semibold text-neutral-900 dark:text-white">
                      James Scott
                    </h4>
                    <p className="text-sm text-neutral-500 dark:text-neutral-400">
                      Paramedic
                    </p>
                  </div>
                </div>
                <p className="text-neutral-700 dark:text-neutral-300">
                  "The QR code system is brilliant. We scanned a patient's code
                  and immediately knew about their heart condition and
                  medications, saving precious minutes."
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default LandingPage;
