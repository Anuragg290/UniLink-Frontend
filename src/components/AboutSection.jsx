const AboutSection = ({ userData }) => {

  return (
    <div className="bg-white shadow rounded-lg p-6 mb-6">
      <h2 className="text-xl font-semibold mb-4">About</h2>
      <p>{userData?.about}</p>
    </div>
  );
};
export default AboutSection;
