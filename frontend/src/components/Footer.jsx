import candleLogo from '../assets/CANDLE.png';

export default function Footer() {
    return (
        <footer className="bg-charcoal text-beige py-12 border-t-4 border-primary/50">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
                    <div>
                        <h4 className="text-primary font-bold mb-4 border-b border-shadow/50 pb-1">Shop</h4>
                        <ul className="space-y-2 text-sm font-light">
                            <li><a href="#" className="hover:text-flame transition">All Candles</a></li>
                            <li><a href="#" className="hover:text-flame transition">Gift Sets</a></li>
                            <li><a href="#" className="hover:text-flame transition">Wax Melts</a></li>
                            <li><a href="#" className="hover:text-flame transition">Aromatherapy</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-primary font-bold mb-4 border-b border-shadow/50 pb-1">About Us</h4>
                        <ul className="space-y-2 text-sm font-light">
                            <li><a href="#" className="hover:text-flame transition">Our Story</a></li>
                            <li><a href="#" className="hover:text-flame transition">Ethical Sourcing</a></li>
                            <li><a href="#" className="hover:text-flame transition">In the Press</a></li>
                            <li><a href="#" className="hover:text-flame transition">Careers</a></li>
                        </ul>
                    </div>
                    <div>
                        <h4 className="text-primary font-bold mb-4 border-b border-shadow/50 pb-1">Support</h4>
                        <ul className="space-y-2 text-sm font-light">
                            <li><a href="#" className="hover:text-flame transition">FAQ</a></li>
                            <li><a href="#" className="hover:text-flame transition">Shipping & Returns</a></li>
                            <li><a href="#" className="hover:text-flame transition">T&Cs</a></li>
                            <li><a href="#" className="hover:text-flame transition">Contact Us</a></li>
                        </ul>
                    </div>
                    <div className="col-span-2 md:col-span-1">
                        {/* Brand Logo Block */}
                        <div className="mb-6 flex items-center gap-3">
                            <img src={candleLogo} alt="Logo" className="h-10 w-10 rounded-full object-cover brightness-0 invert opacity-90" />
                            <span className="text-xl font-serif font-bold text-white tracking-tight">CandlesWithKinzee</span>
                        </div>

                        <p className="text-sm mb-4 text-beige/80">Sign up for exclusive offers and updates on new limited-edition scents.</p>
                        <div className="mt-3 flex shadow-lg rounded-lg overflow-hidden">
                            <input
                                type="email"
                                placeholder="Your email address"
                                className="p-3 w-full bg-charcoal/80 text-beige border-r-0 focus:outline-none placeholder-beige/50"
                            />
                            <button className="bg-flame text-charcoal p-3 font-semibold hover:bg-primary transition duration-300">
                                Subscribe
                            </button>
                        </div>
                        <div className='flex space-x-4 mt-6 justify-center md:justify-start'>
                            {/* Simple Social Icons - Placeholder SVGs */}
                            {['M', 'T', 'I'].map(icon => (
                                <a key={icon} href='#' className='text-primary hover:text-flame transition duration-200'>
                                    <span className="w-6 h-6 inline-flex items-center justify-center border border-primary rounded-full">{icon}</span>
                                </a>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="pt-8 border-t border-shadow/30 text-center text-sm text-beige/60 flex flex-col md:flex-row justify-center items-center gap-2">
                    <img src={candleLogo} alt="Logo" className="h-6 w-6 rounded-full object-cover brightness-0 invert opacity-50" />
                    <p>&copy; {new Date().getFullYear()} CandlesWithKinzee. Handcrafted Comfort.</p>
                </div>
            </div>
        </footer>
    );
}
