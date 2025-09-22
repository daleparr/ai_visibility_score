# Brand Playbook Implementation Guide

This guide will walk you through the process of creating and publishing your `aidi-brand.json` file to improve your AI Discoverability Index (AIDI) score.

## 1. What is the Brand Playbook?

The Brand Playbook is a machine-readable JSON file that provides AI models with accurate, up-to-date information about your brand. By creating this file, you can:

-   **Reduce hallucinations** and ensure AI models have the correct facts about your brand.
-   **Maintain a consistent brand voice** across all AI-generated content.
-   **Improve your AIDI score** by providing clear signals to our evaluation agents.

## 2. Getting Started

-   **Download the Starter Kit**: The starter kit contains a sample `aidi-brand.json` file and a `aidi-brand.schema.json` file for validation.
-   **Edit the `aidi-brand.json` file**: Fill in the details for your brand. See the "Field Specifications" section below for guidance on each field.
-   **Validate your file (optional)**: You can use a JSON schema validator to ensure your `aidi-brand.json` file conforms to the `aidi-brand.schema.json`.

## 3. Publishing Your Playbook

-   **Place the file in the `.well-known` directory**: The `aidi-brand.json` file must be accessible at `/.well-known/aidi-brand.json` on your domain.
-   **Verify the installation**: Once the file is live, go to the "Brand Playbook" page in your AIDI dashboard and click "Verify Installation".

## 4. Field Specifications

**(This section would contain a detailed explanation of each field in the `aidi-brand.json` file, similar to the original prompt.)**
