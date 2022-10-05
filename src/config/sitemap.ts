import { PrismaClient } from '@prisma/client';
import { env } from 'src/env/server.mjs';
import { SitemapDefaultValues, SitemapUrl } from '../model/sitemap';

export const sitemapDefaultValues: SitemapDefaultValues = {
  changefreq: 'monthly',
  priority: 0.7,
};

export const baseUrl = env.PRODUCTION_URL;

const prismaClient = new PrismaClient();

export const getSitemapLocales = async (): Promise<string[]> => {
  const languages = await prismaClient.languages.findMany({
    select: {
      code: true,
    },
  });
  const result = languages.map(c => c.code.toLowerCase()).filter(c => c && c !== 'es');
  return result;
}

// eslint-disable-next-line @typescript-eslint/require-await
export const getSitemapUrlsData = async (): Promise<SitemapUrl[]> => {
  const sitemapUrlsData = new Array<SitemapUrl>(
    {
      loc: '/',
      priority: 1,
    },
    {
      loc: '/contact',
      priority: 0.9,
    },
    {
      loc: '/team',
    },
  );

  const prismaClient = new PrismaClient();
  const members = await prismaClient.crew.findMany({
    select: {
      slug: true,
    },
    where: {
      status: 'published',
    }
  });

  const memberSlugs = members.map((member) => member.slug).filter((x) => x);
  if (memberSlugs) {
    sitemapUrlsData.push(
      ...memberSlugs.map(
        (slug): SitemapUrl => ({
          loc: `/team/${slug}`,
        }),
      ),
    );
  }

  const pages = await prismaClient.markdownPages.findMany({
    select: {
      slug: true,
    },
    where: {
      status: 'published',
    }
  });

  const pagesSlugs = pages.map((page) => page.slug).filter((x) => x);
  if (pagesSlugs) {
    sitemapUrlsData.push(
      ...pagesSlugs.map(
        (slug): SitemapUrl => ({
          loc: `/${slug}`,
        }),
      ),
    );
  }

  return sitemapUrlsData;
};
