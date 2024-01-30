import * as React from 'react'
import { BareLayout } from '../_components/layout/Layout'

// 950: 30 27 75
// 800: 55 48 163
// 700: 67 56 202

type LandingPageProps = {}
export const LandingPage = ({}: LandingPageProps) => {
  return (
    <BareLayout>
      <div className='relative h-full isolate overflow-y-scroll overflow-x-hidden bg-indigo-700'>
        <header className=''>
          <nav className='mx-auto flex max-w-7xl items-center justify-between p-6 lg:px-8' aria-label='Global'>
            <div className='flex flex-1 justify-end'>
              <a href='login.html' className='text-sm leading-6 text-white text-opacity-60'>
                M'identifier <span aria-hidden='true'>&rarr;</span>
              </a>
            </div>
          </nav>
        </header>
        {/** Background ondulation */}
        <div
          className='absolute left-[calc(50%-4rem)] top-10 -z-10 transform-gpu blur-3xl sm:left-[calc(50%-18rem)] lg:left-48 lg:top-[calc(50%-30rem)] xl:left-[calc(50%-24rem)]'
          aria-hidden='true'>
          <div
            className='aspect-[1108/632] w-[69.25rem] bg-gradient-to-r from-[#e879f9] to-[#4338ca] opacity-20'
            style={{
              clipPath:
                'polygon(73.6% 51.7%, 91.7% 11.8%, 100% 46.4%, 97.4% 82.2%, 92.5% 84.9%, 75.7% 64%, 55.3% 47.5%, 46.5% 49.4%, 45% 62.9%, 50.3% 87.2%, 21.3% 64.1%, 0.1% 100%, 5.4% 51.1%, 21.4% 63.9%, 58.9% 0.2%, 73.6% 51.7%)',
            }}
          />
        </div>
        <div className='mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-40'>
          <div className='mx-auto max-w-2xl flex-shrink-0 lg:mx-0 lg:max-w-xl lg:pt-8'>
            {/** LOGO */}
            <div className='relative lg:-top-10 flex items-center'>
              <img
                src='http://localhost:3000/images/2024-02-01 Logotype TDF2.png'
                className='opacity-100 h-24 relative -left-3 lg:left-0'
              />
              {/* <div className='text-white text-opacity-100 uppercase tracking-wide text-xl font-bold relative -left-3 lg:left-0'>
                Trésor de famille
              </div> */}
            </div>
            {/** Petits badges au dessus du slogan */}
            <div className='mt-12 sm:mt-12'>
              <span className='rounded-full bg-white/10 px-3 py-1 text-sm leading-6 text-white/60 ring-1 ring-inset ring-white/20'>
                En cours de construction
              </span>
              {/* <a href='#' className='inline-flex space-x-6'>
                <span className='rounded-full bg-indigo-500/10 px-3 py-1 text-sm font-semibold leading-6 text-indigo-400 ring-1 ring-inset ring-indigo-500/20'>
                  What's new
                </span>
                <span className='inline-flex items-center space-x-2 text-sm font-medium leading-6 text-gray-300'>
                  <span>Just shipped v1.0</span>
                  <ChevronRightIcon className='h-5 w-5 text-gray-500' aria-hidden='true' />
                </span>
              </a> */}
            </div>
            <h1 className='mt-10 text-4xl font-bold tracking-tight text-white sm:text-6xl'>
              Valorisons notre mémoire familiale
            </h1>
            <p className='mt-6 text-lg leading-8 text-gray-300'>
              Parce que si nous ne faisons rien, le temps aura raison de nos plus beaux souvenirs familiaux.
            </p>
            <p className='mt-2 text-lg leading-8 text-gray-300'>
              Trésor de famille est une application pour vous aider à enrichir vos documents, photos, vidéos, ... et les
              conserver pour l'éternité.
            </p>
            <div className='mt-10 flex items-center gap-x-6'>
              <a
                href='https://forms.gle/c347tRZBksQJVg9N7'
                target='_blank'
                className='rounded-md bg-indigo-500 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-400'>
                Ça m'intéresse
              </a>
              <a href='/login.html' className='text-sm font-semibold leading-6 text-white'>
                J'y suis déjà <span aria-hidden='true'>→</span>
              </a>
            </div>
          </div>

          <div className='mx-auto flex mt-10 sm:max-w-2xl lg:mt-0 lg:aspect-h-7 lg:aspect-w-10 w-full overflow-hidden rounded-lg'>
            <img
              src='https://tresordefamille.org/images/Treasure-chest-3-optim.jpg'
              alt='Un coffre en bois, dans un grenier, rempli des vieilles photos, pellicules, films, est éclairé par un rayon de soleil et retrouve la vie !'
              className='transform -scale-x-100 w-full sm:w-[50vw] object-scale-down sm:object-cover rounded-md bg-white/5 shadow-2xl ring-1 ring-white/10'
            />
          </div>
        </div>
      </div>
    </BareLayout>
  )
}
