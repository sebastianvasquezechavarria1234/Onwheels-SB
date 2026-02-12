"use client";

import React from "react";

import { Hero } from "../components/landing/Hero";
import { Layout } from "../layout/Layout";
import { FeaturedProducts } from "../components/landing/FeaturedProducts";
import { UpcomingEvents } from "../components/landing/UpcomingEvents";
import { LearningSection } from "../components/landing/LearningSection";
import { CommunityReels } from "../components/landing/CommunityReels";

export const Home = () => {
    return (
        <Layout>
            <Hero />
            <FeaturedProducts />
            <UpcomingEvents />
            <LearningSection />
            <CommunityReels />
        </Layout>
    )
}