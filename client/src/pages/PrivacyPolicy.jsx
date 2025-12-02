import styled from 'styled-components';
import { FaShieldAlt } from 'react-icons/fa';

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 40px 20px;
  color: #fff;
  min-height: calc(100vh - var(--navbar-h));

  @media (max-width: 768px) {
    padding: 20px 16px;
  }
`;

const Header = styled.div`
  margin-bottom: 40px;
  text-align: center;
  border-bottom: 2px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 30px;
`;

const IconWrapper = styled.div`
  font-size: 48px;
  color: var(--primary-color);
  margin-bottom: 16px;
  display: flex;
  justify-content: center;

  @media (max-width: 768px) {
    font-size: 36px;
  }
`;

const Title = styled.h1`
  font-family: var(--secondary-fonts);
  font-size: 36px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 12px;

  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const LastUpdated = styled.p`
  font-family: var(--primary-fonts);
  font-size: 14px;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
`;

const Section = styled.section`
  margin-bottom: 40px;

  @media (max-width: 768px) {
    margin-bottom: 32px;
  }
`;

const SectionTitle = styled.h2`
  font-family: var(--secondary-fonts);
  font-size: 24px;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 16px;
  padding-bottom: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const SectionContent = styled.div`
  font-family: var(--primary-fonts);
  font-size: 16px;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.8;

  p {
    margin-bottom: 16px;
  }

  ul, ol {
    margin: 16px 0;
    padding-left: 24px;
  }

  li {
    margin-bottom: 8px;
  }

  strong {
    color: #fff;
    font-weight: 600;
  }

  @media (max-width: 768px) {
    font-size: 15px;
  }
`;

const PrivacyPolicy = () => {
  return (
    <Container>
      <Header>
        <IconWrapper>
          <FaShieldAlt />
        </IconWrapper>
        <Title>Privacy Policy</Title>
        <LastUpdated>Last Updated: December 2, 2024</LastUpdated>
      </Header>

      <Section>
        <SectionTitle>1. Introduction</SectionTitle>
        <SectionContent>
          <p>
            Welcome to Mysoov. We respect your privacy and are committed to
            protecting your personal data. This privacy policy will inform you
            about how we look after your personal data when you visit our
            platform and tell you about your privacy rights and how the law
            protects you.
          </p>
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle>2. Information We Collect</SectionTitle>
        <SectionContent>
          <p>We collect and process the following types of information:</p>
          <ul>
            <li>
              <strong>Account Information:</strong> Username, email address,
              password, and profile information you provide when registering.
            </li>
            <li>
              <strong>Content:</strong> Videos, posts, comments, and other
              content you upload or share on the platform.
            </li>
            <li>
              <strong>Usage Data:</strong> Information about how you use our
              platform, including viewing history, interactions, and preferences.
            </li>
            <li>
              <strong>Device Information:</strong> IP address, browser type,
              operating system, and device identifiers.
            </li>
            <li>
              <strong>Cookies and Similar Technologies:</strong> Data collected
              through cookies and similar tracking technologies.
            </li>
          </ul>
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle>3. How We Use Your Information</SectionTitle>
        <SectionContent>
          <p>We use your information for the following purposes:</p>
          <ul>
            <li>To provide and maintain our services</li>
            <li>To personalize your experience and recommend content</li>
            <li>To communicate with you about your account and our services</li>
            <li>To improve and optimize our platform</li>
            <li>To ensure security and prevent fraud</li>
            <li>To comply with legal obligations</li>
            <li>To analyze usage patterns and trends</li>
          </ul>
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle>4. Information Sharing and Disclosure</SectionTitle>
        <SectionContent>
          <p>We may share your information in the following circumstances:</p>
          <ul>
            <li>
              <strong>Public Content:</strong> Content you post publicly is
              visible to other users of the platform.
            </li>
            <li>
              <strong>Service Providers:</strong> We share data with trusted
              third-party service providers who assist us in operating our
              platform.
            </li>
            <li>
              <strong>Legal Requirements:</strong> We may disclose information
              when required by law or to protect our rights and safety.
            </li>
            <li>
              <strong>Business Transfers:</strong> In the event of a merger,
              acquisition, or sale of assets, your information may be
              transferred.
            </li>
          </ul>
          <p>
            We do not sell your personal information to third parties for their
            marketing purposes.
          </p>
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle>5. Data Security</SectionTitle>
        <SectionContent>
          <p>
            We implement appropriate technical and organizational measures to
            protect your personal data against unauthorized access, alteration,
            disclosure, or destruction. However, no method of transmission over
            the internet or electronic storage is 100% secure, and we cannot
            guarantee absolute security.
          </p>
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle>6. Your Rights and Choices</SectionTitle>
        <SectionContent>
          <p>You have the following rights regarding your personal data:</p>
          <ul>
            <li>
              <strong>Access:</strong> You can request access to your personal
              data.
            </li>
            <li>
              <strong>Correction:</strong> You can update or correct your
              information through your account settings.
            </li>
            <li>
              <strong>Deletion:</strong> You can request deletion of your
              account and associated data.
            </li>
            <li>
              <strong>Data Portability:</strong> You can request a copy of your
              data in a portable format.
            </li>
            <li>
              <strong>Opt-Out:</strong> You can opt-out of certain data
              collection and marketing communications.
            </li>
          </ul>
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle>7. Cookies and Tracking Technologies</SectionTitle>
        <SectionContent>
          <p>
            We use cookies and similar tracking technologies to enhance your
            experience, analyze usage, and provide personalized content. You can
            control cookie preferences through your browser settings, but
            disabling cookies may affect the functionality of our platform.
          </p>
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle>8. Third-Party Links</SectionTitle>
        <SectionContent>
          <p>
            Our platform may contain links to third-party websites or services.
            We are not responsible for the privacy practices of these third
            parties. We encourage you to review their privacy policies before
            providing any personal information.
          </p>
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle>9. Children's Privacy</SectionTitle>
        <SectionContent>
          <p>
            Our services are not intended for children under the age of 13. We
            do not knowingly collect personal information from children under 13.
            If you believe we have collected information from a child under 13,
            please contact us immediately.
          </p>
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle>10. Data Retention</SectionTitle>
        <SectionContent>
          <p>
            We retain your personal data for as long as necessary to provide our
            services and fulfill the purposes outlined in this privacy policy.
            When you delete your account, we will delete or anonymize your
            personal data, except where we are required to retain it for legal
            purposes.
          </p>
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle>11. International Data Transfers</SectionTitle>
        <SectionContent>
          <p>
            Your information may be transferred to and processed in countries
            other than your country of residence. We ensure appropriate
            safeguards are in place to protect your data in accordance with this
            privacy policy.
          </p>
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle>12. Changes to This Privacy Policy</SectionTitle>
        <SectionContent>
          <p>
            We may update this privacy policy from time to time. We will notify
            you of any significant changes by posting the new privacy policy on
            this page and updating the "Last Updated" date. We encourage you to
            review this privacy policy periodically.
          </p>
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle>13. Contact Us</SectionTitle>
        <SectionContent>
          <p>
            If you have any questions about this privacy policy or our privacy
            practices, please contact us at:
          </p>
          <p>
            <strong>Email:</strong> privacy@mysoov.com
          </p>
        </SectionContent>
      </Section>
    </Container>
  );
};

export default PrivacyPolicy;
