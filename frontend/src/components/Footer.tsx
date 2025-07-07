
export default function Footer(){
  
  return (
    <footer className="px-4 py-12 border-t">
      <section>
        <div className='container grid grid-cols-1 lg:grid-cols-4 gap-8'>
          <div>
            <div className='mb-3'>
              <span className='font-bold text-xl'>BlogSpot</span>
            </div>
            <p className="text-muted-foreground">Sharing knowledge and insights about web development, design and technology.</p>
          </div>
          <div>
            <h3 className='font-semibold mb-3'>Quick Links</h3>
            <div className='text-muted-foreground space-y-2'>
              <p>All Posts</p>
              <p>Categories</p>
              <p>About</p>
              <p>Contact</p>
            </div>
          </div>
          <div>
            <h3 className='font-semibold mb-3'>Categories</h3>
            <div className='text-muted-foreground space-y-2'>
              <p>Technology</p>
              <p>Development</p>
              <p>Design</p>
              <p>Tutorial</p>
            </div>
          </div>
          <div>
            <h3 className='font-semibold mb-3'>Social Links</h3>
            <div className='text-muted-foreground space-y-2'>
              <p>Twitter</p>
              <p>GitHub</p>
              <p>LinkedIn</p>
              <p>RSS Feed</p>
            </div>

          </div>
        </div>
      </section>
      <section className="mt-8 pt-8 border-t">
        <p className="text-center text-muted-foreground">©2025 BlogSpot. All Rights Reserved.</p>
      </section>
    </footer>
  )
}
