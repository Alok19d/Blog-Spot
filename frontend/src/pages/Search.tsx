import { useState } from "react";
import { ArrowDownUp, ChevronRight, Search } from "lucide-react";

export default function SearchPosts() {
  
  const [searchTerm, setSearchTerm] = useState('');
  const [category, setCategory] = useState('');
  const [posts, setPosts] = useState([]);

  function handleSearch(e){
    setSearchTerm(e.target.value);
  }

  return (
    <main>
      <section className="container">
        <div className="px-6 py-12 text-center">
          <h1 className="text-4xl font-bold mb-4">Find the Posts You Need</h1>
          <p className="max-w-2xl mx-auto text-xl text-muted-foreground">Search across articles, tutorials, and insights tailored to your interests — all in one place.</p>
        </div>
        <div className="p-6 border rounded mb-10">
          <div className="flex gap-5">
            <div className="relative flex-1">
              <input 
                className="w-full pl-10 px-3 py-2 text-sm border rounded"
                placeholder="Search articles, authors, or topics..."
                value={searchTerm}
                onChange={handleSearch}
              />
              <Search 
                className="absolute top-2 left-2 text-muted-foreground" 
                size={18}
              />
            </div>
            <div className="px-3 py-2 flex items-center gap-1 text-sm border rounded">
              <p>All Categories</p>
              <ChevronRight className="transform rotate-90" size={16} />
            </div>
            <div className="px-3 py-2 flex items-center gap-1 text-sm border rounded">
              <ArrowDownUp size={18} />
              <p>Sort</p>
            </div>
          </div>
        </div>
        <div></div>
      </section>
    </main>
  )
}
